"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet2, Landmark, Coins, LineChart, ScrollText, Target } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SairButton } from "@/components/dashboard/sair-button";

const NAV = [
  { href: "/dashboard", rotulo: "Orçamento", icone: Wallet2 },
  { href: "/patrimonio", rotulo: "Patrimônio", icone: Landmark },
  { href: "/proventos", rotulo: "Proventos", icone: Coins },
  { href: "/lancamentos-ativos", rotulo: "Lançamentos", icone: ScrollText },
  { href: "/rentabilidade", rotulo: "Rentabilidade", icone: LineChart },
  { href: "/metas", rotulo: "Metas", icone: Target },
];

export function AppHeader({ nome }: { nome?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-borda bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-dourado-claro to-dourado text-navy">
            <LayoutDashboard size={18} />
          </span>
          <div>
            <p className="font-display text-base leading-tight text-foreground">
              Codigo do Investidor
            </p>
            <p className="text-xs leading-tight text-foreground/50">
              {nome ? `Olá, ${nome}` : "Painel financeiro"}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-borda p-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-dourado text-navy"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SairButton />
        </div>
      </div>

      <nav className="flex items-center gap-0.5 border-t border-borda px-1.5 py-1.5 sm:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-none transition ${
              pathname === item.href
                ? "bg-dourado text-navy"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <item.icone size={16} />
            <span className="truncate">{item.rotulo}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
