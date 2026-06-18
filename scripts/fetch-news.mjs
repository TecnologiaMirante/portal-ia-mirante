/**
 * fetch-news.mjs
 * Roda no GitHub Actions todo dia às 07h BRT.
 * Busca RSS de fontes de IA, filtra por relevância,
 * tagueia por setor, traduz artigos em inglês e salva em public/news.json.
 */

import https from "node:https";
import http  from "node:http";
import fs    from "node:fs";
import path  from "node:path";
import { fileURLToPath } from "node:url";
import { Readability } from "@mozilla/readability";
import { JSDOM }       from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT    = path.join(__dirname, "..", "public", "news.json");

/* ── Fontes RSS ─────────────────────────────────────────── */
const SOURCES = [
  // PT-BR — sub-feeds específicos de IA
  { url: "https://canaltech.com.br/rss/inteligencia-artificial/",    name: "Canaltech IA",  lang: "pt" },
  { url: "https://tecnoblog.net/tag/inteligencia-artificial/feed/",  name: "Tecnoblog IA",  lang: "pt" },
  { url: "https://www.tecmundo.com.br/rss/inteligencia-artificial.xml", name: "TecMundo IA", lang: "pt" },
  // PT-BR — feeds gerais filtrados
  { url: "https://canaltech.com.br/rss.xml",                         name: "Canaltech",     lang: "pt" },
  { url: "https://tecnoblog.net/feed/",                               name: "Tecnoblog",     lang: "pt" },
  // EN — serão traduzidos automaticamente para PT-BR
  { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", name: "The Verge AI",  lang: "en" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/",     name: "TechCrunch AI", lang: "en" },
];

/* ── Palavras-chave para filtrar IA ─────────────────────── */
const AI_KW = [
  "intelig", "chatgpt", "openai", "gpt", "gemini", "copilot",
  "claude", "automação", "automaç", "machine learning", "deep learning",
  "llm", "ia generativa", "algoritmo", "neural", "generativa",
  "robô", "inteligência", "aprendizado de máquina", "visão computacional",
  "processamento de linguagem", "modelo de linguagem", "anthropic",
  "meta ai", "midjourney", "stable diffusion", "dall-e", "sora",
  "assistente virtual", "assistente de ia", "chatbot",
  "artificial intelligence", "ai model", "ai tool", "ai system",
  "language model", "generative ai", "google ai", "microsoft ai",
  "ai startup", "chatbot", "ai assistant", "neural network", "foundation model",
];

function isAI(title = "", desc = "") {
  const t = `${title} ${desc}`.toLowerCase();
  return AI_KW.some((k) => t.includes(k));
}

/* ── Tags por setor ─────────────────────────────────────── */
const DEPTS = {
  Marketing:  ["marketing", "publicidade", "campanha", "anúncio", "conteúdo", "mídia", "redes sociais",
               "marca", "consumidor", "criativo", "social media", "instagram", "tiktok", "influencer",
               "advertising", "content", "brand", "audience"],
  RH:         ["rh", "recursos humanos", "emprego", "carreira", "funcionário", "contratação",
               "trabalhador", "talento", "recrutamento", "demissão", "trabalho", "profissional",
               "workforce", "hiring", "employee", "job", "skills"],
  Financeiro: ["banco", "crédito", "pagamento", "fraude", "investimento", "economia", "financeiro",
               "custo", "seguro", "fintech", "bolsa", "mercado financeiro", "receita", "lucro",
               "finance", "banking", "revenue", "budget"],
  Comercial:  ["vendas", "cliente", "crm", "negócio", "proposta", "contrato", "parceria", "lead",
               "e-commerce", "loja", "produto", "serviço", "b2b", "b2c", "sales", "customer",
               "retail", "commerce"],
  Jurídico:   ["lei", "regulação", "lgpd", "privacidade", "direito", "tribunal", "legislação",
               "conformidade", "gdpr", "compliance", "regulatório", "norma", "auditoria",
               "regulation", "legal", "policy", "copyright", "lawsuit"],
  Gestão:     ["gestão", "produtividade", "automação", "processo", "eficiência", "decisão",
               "estratégia", "liderança", "rotina", "agenda", "tarefa", "organização", "foco",
               "reunião", "reuniões", "workflow", "prioridade", "planejamento", "gerenciamento",
               "productivity", "management", "efficiency", "operations"],
  Saúde:      ["saúde", "medicina", "hospital", "diagnóstico", "médico", "paciente", "tratamento",
               "doença", "clínica", "farmácia", "mental", "bem-estar", "health", "medical",
               "clinical", "therapy", "disease"],
  Educação:   ["educação", "escola", "ensino", "aprendizagem", "aluno", "professor", "curso",
               "treinamento", "universidade", "faculdade", "aprender", "estudo", "habilidade",
               "education", "learning", "student", "training", "skill"],
};

function tagDepts(title = "", desc = "", content = "") {
  const t = `${title} ${title} ${desc} ${content.slice(0, 1000)}`.toLowerCase();
  return Object.entries(DEPTS)
    .filter(([, kws]) => kws.some((k) => t.includes(k)))
    .map(([d]) => d);
}

/* ── Filtro de parágrafos lixo ──────────────────────────── */
const JUNK_RE = [
  // PT — newsletter / assinatura
  /assine a newsletter/i,
  /assine o/i,
  /receba (notícias|artigos|conteúdo)/i,
  /inscreva.se/i,
  /cadastre.se/i,
  /newsletter do/i,
  // PT — publicidade / continuação
  /continua após a publicidade/i,
  /publicidade/i,
  // PT — assinatura de autor
  /^por .{0,80}editado por/i,
  /^por .{0,60}[•|]/i,
  // PT — cross-links e recomendações
  /se você gostou/i,
  /talvez (também |você )?se interesse/i,
  /leia (mais|também|a seguir)/i,
  /confira (também|mais|a seguir)/i,
  /veja (também|mais|a seguir)/i,
  /você também pode/i,
  /pode te interessar/i,
  /saiba mais/i,
  /acesse o site/i,
  /clique aqui/i,
  // PT — referências a conteúdo ausente
  /o prompt abaixo/i,
  /os prompts abaixo/i,
  /a lista (abaixo|completa)/i,
  /veja os prompts/i,
  /no tutorial (acima|abaixo)/i,
  /como mostra(do)? (a|o) (imagem|gráfico|tabela)/i,
  // PT — legais
  /termos de uso/i,
  /política de privacidade/i,
  // PT — podcast / mídia / redes
  /ouça o podcast/i,
  /disponível no episódio/i,
  /spotify|deezer|apple podcasts/i,
  /está no whatsapp/i,
  /entre no canal/i,
  /^whatsapp/i,
  /acompanhe (notícias|dicas|conteúdo) (de|do|pelo)/i,
  // Legendas de imagem / foto
  /^\(?(foto|imagem|ilustração|image|photo|crédito)[\s:]/i,
  /\/tecnoblog\)|\/canaltech\)|\/tecmundo\)/i,
  // Cabeçalhos soltos
  /^resumo$/i,
  /^destaques?$/i,
  /^leia mais$/i,
  // EN — junk
  /subscribe to/i,
  /sign up for/i,
  /^newsletter/i,
  /^read more/i,
  /^see also/i,
  /you might (also )?like/i,
  /related articles?/i,
  /terms of service/i,
  /privacy policy/i,
];

function cleanContent(text) {
  if (!text) return null;
  const paragraphs = text
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 80 && !JUNK_RE.some((re) => re.test(p)));
  return paragraphs.length >= 1 ? paragraphs.join("\n\n") : null;
}

/* ── HTTP fetch ─────────────────────────────────────────── */
function fetchUrl(url, redirects = 5, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    if (redirects === 0) return reject(new Error("Too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
          ...extraHeaders,
        },
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          return resolve(fetchUrl(res.headers.location, redirects - 1, extraHeaders));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (data += c));
        res.on("end",  () => resolve(data));
      }
    );
    req.on("error",   reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

/* ── Tradução PT-BR via Google Translate (gratuito) ─────── */
async function translateText(text) {
  if (!text?.trim() || text.trim().length < 10) return text;
  try {
    const q   = encodeURIComponent(text.slice(0, 4800));
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=${q}`;
    const raw = await fetchUrl(url, 3, { Accept: "application/json, */*" });
    const json = JSON.parse(raw);
    return json[0].map(([t]) => t).join("").trim() || text;
  } catch {
    return text; // fallback silencioso
  }
}

/* ── Parser RSS/Atom ────────────────────────────────────── */
function between(str, open, close) {
  const s = str.indexOf(open);
  if (s === -1) return "";
  const e = str.indexOf(close, s + open.length);
  if (e === -1) return "";
  return str.slice(s + open.length, e).trim();
}

function stripHtml(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(block) {
  // enclosure image
  const enc = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i)?.[1]
           || block.match(/<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i)?.[1];
  if (enc) return enc;

  // media:content
  const media = block.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1];
  if (media) return media;

  // media:thumbnail (TechCrunch, Verge)
  const thumb = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1];
  if (thumb) return thumb;

  // img src na description/content
  const img = block.match(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))[^"']*["']/i)?.[1];
  if (img) return img;

  // img src sem extensão explícita (CDNs como i.guim.co.uk, etc.)
  const imgAny = block.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i)?.[1];
  if (imgAny && !imgAny.includes("pixel") && !imgAny.includes("tracking")) return imgAny;

  return null;
}

function parseBlock(block, sourceName, lang) {
  const rawTitle = between(block, "<title>", "</title>")
                || between(block, "<title><![CDATA[", "]]></title>");
  const title    = stripHtml(rawTitle);

  // Conteúdo completo (RSS content:encoded ou Atom content)
  const rawFull  = between(block, "<content:encoded>", "</content:encoded>")
                || between(block, "<content", "</content>")
                || between(block, "<summary", "</summary>");
  // Descrição curta
  const rawDesc  = between(block, "<description>", "</description>")
                || between(block, "<summary>", "</summary>");

  const fullText   = rawFull ? stripHtml(rawFull) : "";
  const descText   = stripHtml(rawDesc || rawFull);
  const description = descText.slice(0, 300);

  // Usa content:encoded se tiver substância; senão usa a descrição como fallback
  const rssContent = fullText.length > 300
    ? cleanContent(fullText.slice(0, 8000))
    : (descText.length > 150 ? descText.slice(0, 2000) : null);

  // Link
  const rawLink = between(block, "<link>", "</link>")
               || block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1]
               || between(block, "<guid>", "</guid>")
               || between(block, "<id>", "</id>");
  const link = (rawLink || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .trim();

  // Data
  const rawPub = between(block, "<pubDate>", "</pubDate>")
              || between(block, "<published>", "</published>")
              || between(block, "<updated>", "</updated>");
  const pubDate = rawPub
    ? rawPub.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim()
    : new Date().toISOString();

  const image = extractImage(block);

  if (!title || !link) return null;
  return { title, description, url: link, publishedAt: pubDate, image, source: sourceName, content: rssContent, lang };
}

function parseRSS(xml, sourceName, lang = "pt") {
  const items = [];

  // RSS <item>
  const rssRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = rssRe.exec(xml)) !== null) {
    const parsed = parseBlock(m[1], sourceName, lang);
    if (parsed) items.push(parsed);
  }

  // Atom <entry> (se não encontrou itens RSS)
  if (items.length === 0) {
    const atomRe = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((m = atomRe.exec(xml)) !== null) {
      const parsed = parseBlock(m[1], sourceName, lang);
      if (parsed) items.push(parsed);
    }
  }

  return items;
}

/* ── Tenta buscar HTML de uma URL com headers de browser real ── */
async function fetchPage(url) {
  return fetchUrl(url, 5, {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language":  "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding":  "gzip, deflate, br",
    "Cache-Control":    "no-cache",
    "Pragma":           "no-cache",
    "Sec-Fetch-Dest":   "document",
    "Sec-Fetch-Mode":   "navigate",
    "Sec-Fetch-Site":   "none",
    "Upgrade-Insecure-Requests": "1",
  });
}

/* ── Extrai conteúdo de HTML via Readability + fallback regex ── */
function extractFromHtml(html, url) {
  // og:image
  const ogImage =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1] ||
    null;

  let content = null;

  // ── Readability (Mozilla Reader Mode) ──
  try {
    const dom     = new JSDOM(html, { url });
    const reader  = new Readability(dom.window.document, { charThreshold: 80 });
    const article = reader.parse();

    if (article?.content) {
      const cDom  = new JSDOM(article.content);
      const paras = Array.from(cDom.window.document.querySelectorAll("p, li"))
        .map((el) => el.textContent.trim())
        .filter((t) => t.length > 60 && !JUNK_RE.some((re) => re.test(t)));

      if (paras.length >= 2) {
        content = cleanContent(paras.slice(0, 18).join("\n\n"));
      }
    }
  } catch { /* segue para fallback */ }

  // ── Fallback regex ──
  if (!content) {
    const ZONE_PATTERNS = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /class=["'][^"']*(?:entry-content|post-content|article-body|article__content|post-body|td-post-content|single-content|article__text)[^"']*["'][^>]*>([\s\S]{300,})/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ];
    let zone = null;
    for (const pat of ZONE_PATTERNS) {
      const m = html.match(pat);
      if (m?.[1]?.length > 300) { zone = m[1]; break; }
    }
    if (zone) {
      const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      const paras = [];
      let pm;
      while ((pm = pRe.exec(zone)) !== null) {
        const t = stripHtml(pm[1]);
        if (t.length > 60) paras.push(t);
      }
      if (paras.length > 0) content = cleanContent(paras.slice(0, 16).join("\n\n"));
    }
  }

  return { content, ogImage };
}

/* ── Gera URL da versão AMP do artigo ───────────────────── */
function toAmpUrl(url) {
  try {
    const u = new URL(url);
    // Padrão WordPress: /slug/ → /slug/amp/
    if (!u.pathname.endsWith("/amp/")) {
      u.pathname = u.pathname.replace(/\/?$/, "/amp/");
    }
    return u.toString();
  } catch {
    return null;
  }
}

/* ── Scraper principal: tenta URL original → AMP → desiste ─ */
async function fetchContent(url) {
  // 1. Tenta URL original
  let originalResult = { content: null, ogImage: null };
  try {
    const html = await fetchPage(url);
    originalResult = extractFromHtml(html, url);
    if (originalResult.content) return originalResult;
  } catch (e) {
    process.stdout.write(`[${e.message}] `);
  }

  // 2. Tenta versão AMP
  const ampUrl = toAmpUrl(url);
  if (ampUrl && ampUrl !== url) {
    try {
      const ampHtml = await fetchPage(ampUrl);
      const ampResult = extractFromHtml(ampHtml, ampUrl);
      return {
        content: ampResult.content || originalResult.content,
        ogImage: originalResult.ogImage || ampResult.ogImage,
      };
    } catch (e) {
      process.stdout.write(`[AMP:${e.message}] `);
    }
  }

  return originalResult;
}

/* ── Delay simples ──────────────────────────────────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Revisão com Gemini ─────────────────────────────────── */
async function reviewWithGemini(rawText, title) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || rawText.length < 100) return rawText;

  const prompt = `Você é um editor-chefe de um portal de notícias de tecnologia brasileiro.

Recebeu o texto bruto de uma matéria sobre Inteligência Artificial extraído automaticamente de um site de notícias. O texto pode conter elementos de navegação, recomendações de outros artigos e fragmentos incompletos misturados com o conteúdo real.

Sua tarefa é produzir uma matéria jornalística limpa, coesa e completa.

━━━ ESTRUTURA OBRIGATÓRIA ━━━
1. Primeiro parágrafo = LEAD: 2 a 3 frases que resumem o fato mais importante e prendem o leitor
2. Demais parágrafos = CORPO: parágrafos bem desenvolvidos em ordem de importância

━━━ REMOVA COMPLETAMENTE (sem deixar nenhum rastro) ━━━
- Qualquer frase que recomende ou promova outro artigo/conteúdo
  → "Se você gostou...", "Talvez também se interesse por...", "Confira também...", "Leia também...", "Veja mais sobre..."
- Frases que referenciam prompts, listas ou conteúdo que NÃO está presente no texto
  → "O prompt abaixo...", "Veja os prompts...", "A lista completa está...", "No tutorial acima..."
- Legendas de imagens → "(Foto: X/Tecnoblog)", "(Imagem: Y)", "(Ilustração: Z/Canaltech)" — qualquer texto entre parênteses que seja crédito visual
- A palavra "Resumo" quando aparece isolada como cabeçalho
- O título da matéria se aparecer repetido no início ou no final do texto
- Chamadas de podcast, rádio, Spotify, Deezer, Apple Podcasts, YouTube, WhatsApp
- Chamadas de newsletter e assinatura
- CTAs genéricos ("acesse", "clique aqui", "saiba mais", "cadastre-se")
- Assinaturas de autor, editores e data de publicação
- Emojis promocionais e decorativos
- Fragmentos de frases que fazem referência a elementos visuais ausentes (imagens, gráficos, tabelas, botões)
- Subtítulos e títulos de seções internos ao artigo

━━━ MANTENHA OBRIGATORIAMENTE ━━━
- Todos os fatos, dados, números, percentuais e estatísticas
- Citações diretas de pessoas (entre aspas com atribuição)
- Contexto, explicações e análises relevantes
- Consequências e impactos mencionados

━━━ COESÃO ━━━
- Cada parágrafo deve fluir naturalmente para o próximo
- Remova qualquer frase que quebre o fluxo ou pareça deslocada do contexto
- Se um parágrafo fica incompreensível sem o conteúdo removido, reescreva-o com as informações disponíveis ou remova-o

━━━ ESTILO ━━━
- Português brasileiro claro, objetivo e moderno
- Tom informativo, sem sensacionalismo
- Parágrafos separados por linha em branco dupla

Título: ${title}

RETORNE APENAS o texto final corrido. Sem título, sem subtítulos, sem markdown, sem emojis, sem numeração.

Texto bruto:
${rawText.slice(0, 5500)}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1800, topP: 0.85 },
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path:     `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method:   "POST",
        headers:  {
          "Content-Type":   "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 25000,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const json    = JSON.parse(data);
            const revised = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            resolve(revised && revised.length > 100 ? revised : rawText);
          } catch {
            resolve(rawText);
          }
        });
      }
    );
    req.on("error",   () => resolve(rawText));
    req.on("timeout", () => { req.destroy(); resolve(rawText); });
    req.write(body);
    req.end();
  });
}

/* ── Executa tarefas com limite de concorrência ─────────── */
async function withConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

/* ── Main ───────────────────────────────────────────────── */
async function main() {
  console.log("📡 Buscando notícias de IA...\n");

  const seen    = new Set();
  const results = await Promise.allSettled(
    SOURCES.map(async (s) => {
      try {
        console.log(`  → [${s.lang.toUpperCase()}] ${s.name}: ${s.url}`);
        const xml   = await fetchUrl(s.url, 5, {
          "User-Agent": "Mozilla/5.0 (compatible; MiranteNewsBot/2.0; +https://portalia-mirante.onrender.com)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        });
        const items = parseRSS(xml, s.name, s.lang);
        console.log(`     ✓ ${items.length} itens`);
        return items;
      } catch (err) {
        console.warn(`     ✗ ${err.message}`);
        return [];
      }
    })
  );

  const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  console.log(`\n📦 Total bruto: ${all.length}`);

  // Filtra por IA e deduplica
  const aiItems = all
    .filter((a) => isAI(a.title, a.description))
    .filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

  console.log(`🤖 Relacionados a IA: ${aiItems.length}`);

  // Adiciona tags e ordena por data
  const tagged = aiItems
    .map((a) => ({ ...a, depts: tagDepts(a.title, a.description, a.content || "") }))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 40);

  // ── Scrape: conteúdo + og:image para artigos sem imagem ou sem conteúdo ──
  const needsScrape = tagged.filter(
    (a) => !a.content || a.content.length < 200 || !a.image
  );
  console.log(`\n🔍 Artigos com conteúdo RSS: ${tagged.length - needsScrape.filter(a => !a.content || a.content.length < 200).length} | Scrape necessário: ${needsScrape.length}`);

  if (needsScrape.length > 0) {
    await withConcurrency(needsScrape, 4, async (article, i) => {
      process.stdout.write(`  [${i + 1}/${needsScrape.length}] ${article.title.slice(0, 50)}... `);
      const { content, ogImage } = await fetchContent(article.url);
      if (content  && (!article.content || article.content.length < 200)) article.content = content;
      if (ogImage  && !article.image) article.image = ogImage;
      console.log([
        content  ? `✓ conteúdo (${content.length}ch)` : "– sem conteúdo",
        ogImage  && !article.image ? " + imagem og" : "",
      ].join(""));
    });
  }

  // ── Tradução de artigos em inglês ──
  const enArticles = tagged.filter((a) => a.lang === "en");
  if (enArticles.length > 0) {
    console.log(`\n🌐 Traduzindo ${enArticles.length} artigos (EN → PT-BR)...`);
    for (let i = 0; i < enArticles.length; i++) {
      const a = enArticles[i];
      process.stdout.write(`  [${i + 1}/${enArticles.length}] ${a.title.slice(0, 50)}... `);
      a.title       = await translateText(a.title);
      a.description = await translateText(a.description);
      if (a.content) a.content = await translateText(a.content);
      console.log("✓");
      if (i < enArticles.length - 1) await sleep(400); // evita rate-limit
    }
  }

  // ── Revisão com Gemini (limpa lixo, melhora texto) ──
  const withContent = tagged.filter((a) => a.content && a.content.length > 100);
  if (process.env.GEMINI_API_KEY) {
    console.log(`\n✨ Revisando ${withContent.length} artigos com Gemini 1.5 Flash...`);
    for (let i = 0; i < withContent.length; i++) {
      const a = withContent[i];
      process.stdout.write(`  [${i + 1}/${withContent.length}] ${a.title.slice(0, 52)}... `);
      a.content = await reviewWithGemini(a.content, a.title);
      console.log(`✓ (${a.content.length}ch)`);
      await sleep(600); // evita rate-limit do free tier
    }
  } else {
    console.log("\n⚠️  GEMINI_API_KEY não definida — revisão pulada.");
  }

  // Re-taggeia com texto já traduzido e revisado
  tagged.forEach((a) => {
    a.depts = tagDepts(a.title, a.description, a.content || "");
  });

  // Preserva artigos anteriores se não tiver novos
  let prev = [];
  if (fs.existsSync(OUTPUT)) {
    try { prev = JSON.parse(fs.readFileSync(OUTPUT, "utf8")).articles || []; } catch (_) {}
  }

  const final = tagged.length >= 1 ? tagged : prev;

  const payload = {
    updatedAt: new Date().toISOString(),
    count:     final.length,
    articles:  final,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\n✅ Salvo: ${final.length} artigos em public/news.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
