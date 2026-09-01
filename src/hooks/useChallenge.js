import { useEffect, useState } from "react";

export function useChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/challenges.json")
      .then((r) => r.json())
      .then(({ startDate, challenges }) => {
        const start = new Date(startDate);
        const now = new Date();
        const weekIndex =
          Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) %
          challenges.length;
        const idx = Math.max(0, weekIndex);
        setChallenge(challenges[idx]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { challenge, loading };
}
