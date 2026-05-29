/**
 * fetch-news.mjs
 * Roda no GitHub Actions todo dia às 07h BRT.
 * Busca RSS de fontes de IA, filtra por relevância,
 * tagueia por setor e salva em public/news.json.
 */

import https from "node:https";
import http  from "node:http";
import fs    from "node:fs";
import path  from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT    = path.join(__dirname, "..", "public", "news.json");

/* ── Fontes RSS ─────────────────────────────────────────── */
const SOURCES = [
  // Sub-feeds específicos de IA (maior precisão)
  { url: "https://canaltech.com.br/rss/inteligencia-artificial/", name: "Canaltech IA"   },
  { url: "https://tecnoblog.net/tag/inteligencia-artificial/feed/", name: "Tecnoblog IA" },
  { url: "https://www.tecmundo.com.br/rss/inteligencia-artificial.xml", name: "TecMundo IA" },

  // Feeds gerais de tech (filtrados por palavras-chave)
  { url: "https://canaltech.com.br/rss.xml",              name: "Canaltech"      },
  { url: "https://tecnoblog.net/feed/",                   name: "Tecnoblog"      },

  // Internacional em inglês (AI-focused)
  { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", name: "The Verge AI" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/",     name: "TechCrunch AI" },
];

/* ── Palavras-chave para filtrar IA ─────────────────────── */
const AI_KW = [
  // Português
  "intelig", "chatgpt", "openai", "gpt", "gemini", "copilot",
  "claude", "automação", "automaç", "machine learning", "deep learning",
  "llm", "ia generativa", "algoritmo", "neural", "generativa",
  "robô", "inteligência", "aprendizado de máquina", "visão computacional",
  "processamento de linguagem", "modelo de linguagem", "anthropic",
  "meta ai", "midjourney", "stable diffusion", "dall-e", "sora",
  "assistente virtual", "assistente de ia", "chatbot",
  // Inglês (feeds internacionais)
  "artificial intelligence", "ai model", "ai tool", "ai system",
  "language model", "generative ai", "openai", "google ai",
  "microsoft ai", "ai startup", "machine learning", "deep learning",
  "chatbot", "ai assistant", "neural network", "foundation model",
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
               "productivity", "management", "workflow", "efficiency", "operations"],
  Saúde:      ["saúde", "medicina", "hospital", "diagnóstico", "médico", "paciente", "tratamento",
               "doença", "clínica", "farmácia", "mental", "bem-estar", "health", "medical",
               "clinical", "therapy", "disease"],
  Educação:   ["educação", "escola", "ensino", "aprendizagem", "aluno", "professor", "curso",
               "treinamento", "universidade", "faculdade", "aprender", "estudo", "habilidade",
               "education", "learning", "student", "training", "skill"],
};

function tagDepts(title = "", desc = "", content = "") {
  // Usa título + descrição com peso maior; content como suporte
  const t = `${title} ${title} ${desc} ${content.slice(0, 1000)}`.toLowerCase();
  return Object.entries(DEPTS)
    .filter(([, kws]) => kws.some((k) => t.includes(k)))
    .map(([d]) => d);
}

/* ── Filtro de parágrafos lixo ──────────────────────────── */
const JUNK_RE = [
  /assine a newsletter/i,
  /continua após a publicidade/i,
  /^por .{0,80}editado por/i,
  /^por .{0,60}[•|]/i,
  /termos de uso/i,
  /política de privacidade/i,
  /inscreva.se/i,
  /newsletter do/i,
  /receba notícias/i,
  /^whatsapp/i,
  /cadastre.se/i,
  /você também pode/i,
  /leia (mais|também)/i,
  /confira (também|mais)/i,
  /acesse o site/i,
  /clique aqui/i,
  /saiba mais/i,
];

function cleanContent(text) {
  if (!text) return null;
  const paragraphs = text
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 80 && !JUNK_RE.some((re) => re.test(p)));
  return paragraphs.length >= 2 ? paragraphs.join("\n\n") : null;
}

/* ── HTTP fetch simples ─────────────────────────────────── */
function fetchUrl(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects === 0) return reject(new Error("Too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        timeout: 12000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MiranteNewsBot/1.0; +https://portalia-mirante.onrender.com)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          return resolve(fetchUrl(res.headers.location, redirects - 1));
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
  // enclosure
  const enc = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i)?.[1]
           || block.match(/<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i)?.[1];
  if (enc) return enc;

  // media:content
  const media = block.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1];
  if (media) return media;

  // img src in description/content
  const img = block.match(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))[^"']*["']/i)?.[1];
  if (img) return img;

  return null;
}

function parseRSS(xml, sourceName) {
  const items = [];
  const re    = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;

  while ((m = re.exec(xml)) !== null) {
    const block = m[1];

    const rawTitle = between(block, "<title>", "</title>")
                  || between(block, "<title><![CDATA[", "]]></title>");
    const title   = stripHtml(rawTitle);

    const rawFull = between(block, "<content:encoded>", "</content:encoded>");
    const rawDesc = between(block, "<description>", "</description>");
    const description = stripHtml(rawDesc || rawFull).slice(0, 280);
    // Conteúdo completo do feed (content:encoded), limpo e sem lixo
    const rssContent = rawFull ? cleanContent(stripHtml(rawFull).slice(0, 8000)) : null;

    // link — pode vir como <link>URL ou <link href="URL"
    const rawLink = between(block, "<link>", "</link>") ||
                    block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
                    between(block, "<guid>", "</guid>");
    const link = rawLink
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .trim();

    const rawPub = between(block, "<pubDate>", "</pubDate>")
               || between(block, "<published>", "</published>");
    const pubDate = rawPub
      ? rawPub.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim()
      : new Date().toISOString();

    const image = extractImage(block);

    if (title && link) {
      items.push({ title, description, url: link, publishedAt: pubDate, image, source: sourceName, content: rssContent });
    }
  }

  return items;
}

/* ── Scraper de conteúdo completo ───────────────────────── */
async function fetchContent(url) {
  try {
    const html = await fetchUrl(url);

    // Tenta pegar a zona principal do artigo
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch    = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const zone         = articleMatch?.[1] || mainMatch?.[1] || html;

    // Extrai parágrafos com texto real (> 60 chars)
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    const paragraphs = [];
    let pm;
    while ((pm = pRe.exec(zone)) !== null) {
      const text = stripHtml(pm[1]);
      if (text.length > 60) paragraphs.push(text);
    }

    if (paragraphs.length === 0) return null;
    return cleanContent(paragraphs.slice(0, 14).join("\n\n"));
  } catch {
    return null;
  }
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
        console.log(`  → ${s.name}: ${s.url}`);
        const xml   = await fetchUrl(s.url);
        const items = parseRSS(xml, s.name);
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

  // Adiciona tags (usa content também) e ordena por data
  const tagged = aiItems
    .map((a) => ({ ...a, depts: tagDepts(a.title, a.description, a.content || "") }))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 40);

  // Scrape: só para artigos sem conteúdo do RSS (5 em paralelo)
  const needsScrape = tagged.filter((a) => !a.content || a.content.length < 200);
  console.log(`\n🔍 Artigos com conteúdo RSS: ${tagged.length - needsScrape.length} | Scrape necessário: ${needsScrape.length}`);
  if (needsScrape.length > 0) {
    await withConcurrency(needsScrape, 5, async (article, i) => {
      process.stdout.write(`  [${i + 1}/${needsScrape.length}] ${article.title.slice(0, 55)}... `);
      const scraped = await fetchContent(article.url);
      if (scraped) article.content = scraped;
      console.log(scraped ? `✓ (${scraped.length} chars)` : "– bloqueado");
    });
  }

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
