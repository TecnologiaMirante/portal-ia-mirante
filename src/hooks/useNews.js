/**
 * useNews — lê /news.json gerado pelo GitHub Action diário.
 * Cache local por 1h para evitar fetches repetidos.
 */
import { useState, useEffect } from "react";

const CACHE_KEY = "mirante_news_v3";
const CACHE_TTL = 60 * 60 * 1000; // 1h

export function useNews() {
  const [articles,    setArticles]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = async (force = false) => {
    setLoading(true);
    setError(null);

    /* Cache ─────────────────────────────────────────────── */
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { data, ts } = JSON.parse(raw);
          if (Date.now() - ts < CACHE_TTL && data?.length) {
            setArticles(data);
            setLastUpdated(new Date(ts));
            setLoading(false);
            return;
          }
        }
      } catch (_) {}
    }

    /* Lê /news.json ─────────────────────────────────────── */
    try {
      const res  = await fetch(`/news.json?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = json.articles || [];
      const ts   = Date.now();

      if (data.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts }));
      }

      setArticles(data);
      setLastUpdated(json.updatedAt ? new Date(json.updatedAt) : null);
    } catch (err) {
      setError(err.message);
      console.error("[useNews]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []); // eslint-disable-line

  return { articles, loading, error, lastUpdated, refresh: () => fetchNews(true) };
}
