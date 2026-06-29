"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [pronto, setPronto] = useState(false);

  useEffect(() => setPronto(true), []);

  if (!pronto) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-borda text-foreground/70 transition hover:border-dourado/40 hover:text-dourado"
      aria-label="Alternar tema claro/escuro"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
