"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      sessionStorage.setItem(key, JSON.stringify(fresh));
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { load(); }, [load]);

  // loading só é true na primeira visita (sem cache)
  const isFirstLoad = loading && data === null;

  return { data, loading: isFirstLoad, refresh: load };
}
