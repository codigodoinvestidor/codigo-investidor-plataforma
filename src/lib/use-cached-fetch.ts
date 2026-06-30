"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  initialData?: T
) {
  const [data, setData] = useState<T | null>(() => {
    // 1. usa dado do servidor (primeira renderização)
    if (initialData !== undefined) return initialData;
    // 2. usa cache do sessionStorage (troca de aba)
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(data === null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    if (data === null) setLoading(true);
    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      sessionStorage.setItem(key, JSON.stringify(fresh));
    } finally {
      setLoading(false);
    }
  }, [key, data]);

  useEffect(() => {
    // Se já temos dados do servidor, só atualiza sessionStorage sem mostrar loading
    if (initialData !== undefined) {
      sessionStorage.setItem(key, JSON.stringify(initialData));
      return;
    }
    // Caso contrário, busca normalmente
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, refresh: load };
}
