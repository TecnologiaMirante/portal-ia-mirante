import { useEffect, useState } from "react";

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function useDailyPrompt(filterArea = null) {
  const [allPrompts, setAllPrompts] = useState([]);
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/daily_prompts.json")
      .then((r) => r.json())
      .then(({ prompts }) => {
        setAllPrompts(prompts);
        const pool = filterArea
          ? prompts.filter((p) => p.area === filterArea)
          : prompts;
        const idx = getDayOfYear(new Date()) % pool.length;
        setPrompt(pool[idx]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterArea]);

  return { prompt, allPrompts, loading };
}
