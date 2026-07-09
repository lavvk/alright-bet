"use client";

import { useEffect, useState } from "react";

/** Live-updating "time left" until a unix-seconds deadline. */
export function CountdownTimer({ resolveBy }: { resolveBy: bigint }) {
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Number(resolveBy) * 1000 - Date.now();
  if (diff <= 0) return <span>Closed for betting</span>;

  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const parts = d > 0 ? [`${d}d`, `${h}h`, `${m}m`] : [`${h}h`, `${m}m`, `${sec}s`];
  return <span className="tabular">{parts.join(" ")} left</span>;
}
