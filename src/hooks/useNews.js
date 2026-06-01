/**
 * useNews — lê /news.json gerado pelo GitHub Action diário.
 *
 * Estratégia de cache:
 * 1. Busca apenas o campo `updatedAt` do servidor (request leve, sem body).
 * 2. Compara com o `updatedAt` salvo no cache local.
 * 3. Se forem iguais e o cache tiver menos de 1h → usa o cache.
 * 4. Se forem diferentes → busca o JSON completo e atualiza o cache.
 * Assim, produção e local sempre mostram os mesmos dados do arquivo atual.
 */
import { useState, useEffect } from "react";

// Em dev lê o arquivo local; em produção busca direto do GitHub (sem rebuild)
const NEWS_URL = import.meta.env.DEV
  ? "/news.json"
  : "https://raw.githubusercontent.com/TecnologiaMirante/portal-ia-mirante/main/public/news.json";

const CACHE_KEY = "mirante_news_v4";
const CACHE_TTL = 60 * 60 * 1000; // 1h — segurança máxima

function cleanArticles(articles = []) {
  return articles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt
      ? String(a.publishedAt).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim()
      : a.publishedAt,
  }));
}

export function useNews() {
  const [articles,    setArticles]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      /* 1. Lê o JSON completo do servidor (com cache-buster) */
      const res = await fetch(`${NEWS_URL}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const serverUpdatedAt = json.updatedAt ?? null;

      /* 2. Verifica cache local */
      if (!force) {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (raw) {
            const { data, updatedAt: cachedUpdatedAt, ts } = JSON.parse(raw);
            const cacheRecent = Date.now() - ts < CACHE_TTL;
            const sameVersion = serverUpdatedAt && cachedUpdatedAt === serverUpdatedAt;

            if (cacheRecent && sameVersion && data?.length) {
              setArticles(data);
              setLastUpdated(cachedUpdatedAt ? new Date(cachedUpdatedAt) : new Date(ts));
              setLoading(false);
              return;
            }
          }
        } catch (_) {}
      }

      /* 3. Cache desatualizado ou forçado — usa dados frescos */
      const data = cleanArticles(json.articles || []);

      if (data.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          updatedAt: serverUpdatedAt,
          ts: Date.now(),
        }));
      }

      setArticles(data);
      setLastUpdated(serverUpdatedAt ? new Date(serverUpdatedAt) : null);
    } catch (err) {
      /* 4. Falha de rede — tenta usar cache mesmo que antigo */
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { data, updatedAt: cachedUpdatedAt } = JSON.parse(raw);
          if (data?.length) {
            setArticles(data);
            setLastUpdated(cachedUpdatedAt ? new Date(cachedUpdatedAt) : null);
            setLoading(false);
            return;
          }
        }
      } catch (_) {}

      setError(err.message);
      console.error("[useNews]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []); // eslint-disable-line

  return { articles, loading, error, lastUpdated, refresh: () => fetchNews(true) };
}
