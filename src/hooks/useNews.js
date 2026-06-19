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
    setError(null);

    /* 1. Mostra o cache imediatamente — sem esperar rede */
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { data, updatedAt: cachedUpdatedAt, ts } = JSON.parse(raw);
          if (data?.length) {
            setArticles(data);
            setLastUpdated(cachedUpdatedAt ? new Date(cachedUpdatedAt) : new Date(ts));
            setLoading(false);

            /* Cache recente (< 1h) → não precisa verificar rede */
            if (Date.now() - ts < CACHE_TTL) return;
          }
        }
      } catch { /* ignora erro de leitura */ }
    }

    /* 2. Cache ausente, antigo ou refresh forçado → busca na rede */
    setLoading(true);

    try {
      const res = await fetch(`${NEWS_URL}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const serverUpdatedAt = json.updatedAt ?? null;
      const data = cleanArticles(json.articles || []);

      if (data.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          updatedAt: serverUpdatedAt,
          ts: Date.now(),
        }));
        setArticles(data);
        setLastUpdated(serverUpdatedAt ? new Date(serverUpdatedAt) : null);
      }
    } catch (err) {
      /* Falha de rede — mantém o que já estava na tela (do cache acima) */
      if (!articles.length) setError(err.message);
      console.error("[useNews]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []); // eslint-disable-line

  return { articles, loading, error, lastUpdated, refresh: () => fetchNews(true) };
}
