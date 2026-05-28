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
  { url: "https://oglobo.globo.com/blogs/iai/rss.xml",    name: "O Globo IAI"   },
  { url: "https://www.aidrop.news/feed",                  name: "AIDrop"        },
  { url: "https://www.aidrop.news/rss.xml",               name: "AIDrop"        },
  { url: "https://canaltech.com.br/rss.xml",              name: "Canaltech"     },
  { url: "https://tecnoblog.net/feed/",                   name: "Tecnoblog"     },
  { url: "https://olhardigital.com.br/feed/",             name: "Olhar Digital" },
  { url: "https://www.tecmundo.com.br/rss/news.xml",      name: "TecMundo"      },
];

/* ── Palavras-chave para filtrar IA ─────────────────────── */
const AI_KW = [
  "intelig", "chatgpt", "openai", "gpt-", " gpt", "gemini", "copilot",
  "claude", "automação", "machine learning", "deep learning", "llm",
  "ia generativa", "algoritmo", "neural", "generativa", "automat",
  "robô inteligente", "inteligência artificial",
];

function isAI(title = "", desc = "") {
  const t = `${title} ${desc}`.toLowerCase();
  return AI_KW.some((k) => t.includes(k));
}

/* ── Tags por setor ─────────────────────────────────────── */
const DEPTS = {
  Marketing:  ["marketing", "publicidade", "campanha", "anúncio", "conteúdo", "mídia", "redes sociais", "marca", "consumidor"],
  RH:         ["rh", "recursos humanos", "emprego", "carreira", "funcionário", "contratação", "trabalhador", "talento"],
  Financeiro: ["banco", "crédito", "pagamento", "fraude", "investimento", "economia", "financeiro", "custo", "seguro"],
  Comercial:  ["vendas", "cliente", "crm", "negócio", "proposta", "contrato", "parceria", "lead"],
  Jurídico:   ["lei", "regulação", "lgpd", "privacidade", "direito", "tribunal", "legislação", "conformidade", "gdpr"],
  Gestão:     ["gestão", "produtividade", "automação", "processo", "eficiência", "decisão", "estratégia", "liderança"],
  Saúde:      ["saúde", "medicina", "hospital", "diagnóstico", "médico", "paciente", "tratamento"],
  Educação:   ["educação", "escola", "ensino", "aprendizagem", "aluno", "professor", "curso", "treinamento"],
};

function tagDepts(title = "", desc = "") {
  const t = `${title} ${desc}`.toLowerCase();
  return Object.entries(DEPTS)
    .filter(([, kws]) => kws.some((k) => t.includes(k)))
    .map(([d]) => d);
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

    const rawDesc = between(block, "<description>", "</description>")
                 || between(block, "<content:encoded>", "</content:encoded>");
    const description = stripHtml(rawDesc).slice(0, 280);

    // link — pode vir como <link>URL ou <link href="URL"
    const link = (between(block, "<link>", "</link>") ||
                  block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
                  between(block, "<guid>", "</guid>")).trim();

    const pubDate = between(block, "<pubDate>", "</pubDate>")
                 || between(block, "<published>", "</published>")
                 || new Date().toISOString();

    const image = extractImage(block);

    if (title && link) {
      items.push({ title, description, url: link, publishedAt: pubDate, image, source: sourceName });
    }
  }

  return items;
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

  // Adiciona tags e ordena por data
  const tagged = aiItems
    .map((a) => ({ ...a, depts: tagDepts(a.title, a.description) }))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 40);

  // Preserva artigos anteriores se não tiver novos
  let prev = [];
  if (fs.existsSync(OUTPUT)) {
    try { prev = JSON.parse(fs.readFileSync(OUTPUT, "utf8")).articles || []; } catch (_) {}
  }

  const final = tagged.length >= 5 ? tagged : prev;

  const payload = {
    updatedAt: new Date().toISOString(),
    count:     final.length,
    articles:  final,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\n✅ Salvo: ${final.length} artigos em public/news.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
