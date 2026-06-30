"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setVisible(false);
      setWidth(0);
    }
  }, [pathname]);

  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      setVisible(true);
      setWidth(30);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setWidth(70), 100);
    }
    document.addEventListener("click", onLinkClick);
    return () => document.removeEventListener("click", onLinkClick);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-50 h-0.5 bg-dourado transition-all duration-300 ease-out"
      style={{ width: `${width}%` }}
    />
  );
}
