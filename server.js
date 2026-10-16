import express from 'express';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { version } = JSON.parse(
  readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
);

const app = express();
const PORT = process.env.PORT || 10000;

const ALLOWED_ORIGINS = new Set([
  'https://portalia-mirante.onrender.com',
  'http://localhost:5173',
  'http://localhost:4173',
]);

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

async function probe(url, timeout = 5000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  // 2xx–4xx = serviço respondendo (healthy); 5xx = erro no servidor (unhealthy)
  return r.status < 500 ? 'healthy' : 'unhealthy';
}

async function runCheck(fn) {
  const start = Date.now();
  try {
    const status = await fn();
    return { status, responseTimeMs: Date.now() - start };
  } catch {
    return { status: 'unhealthy', responseTimeMs: Date.now() - start };
  }
}

app.get('/health', async (_req, res) => {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const bucket    = process.env.VITE_FIREBASE_STORAGE_BUCKET;

  const [firestore, firebase_storage, github_news] = await Promise.all([
    runCheck(() =>
      probe(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/creations?pageSize=1`
      )
    ),
    runCheck(() =>
      probe(
        `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?maxResults=1`
      )
    ),
    runCheck(async () => {
      const r = await fetch(
        'https://raw.githubusercontent.com/TecnologiaMirante/portal-ia-mirante/main/public/news.json',
        { signal: AbortSignal.timeout(5000) }
      );
      return r.ok ? 'healthy' : 'degraded';
    }),
  ]);

  const checks = { firestore, firebase_storage, github_news };

  let status = 'healthy';
  for (const c of Object.values(checks)) {
    if (c.status === 'unhealthy') { status = 'unhealthy'; break; }
    if (c.status === 'degraded') status = 'degraded';
  }

  res.status(status === 'unhealthy' ? 503 : 200).json({
    status,
    version,
    timestamp: new Date().toISOString(),
    checks,
  });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () =>
  console.log(`[portal-ia] Server running on port ${PORT}`)
);
