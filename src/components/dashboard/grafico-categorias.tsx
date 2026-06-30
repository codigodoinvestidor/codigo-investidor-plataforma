"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Item = { categoria: string; total: number };

const CORES = ["#3b82f6", "#10b981", "#d4af37", "#ef4444", "#06b6d4", "#a855f7", "#f97316", "#ec4899", "#84cc16"];

const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function GraficoCategorias({ dados }: { dados: Item[] }) {
  if (dados.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-foreground/60">
        Nenhuma despesa cadastrada ainda.
      </p>
    );
  }

  const total = dados.reduce((s, d) => s + d.total, 0);
  const comPct = dados
    .map((d) => ({ ...d, pct: total > 0 ? (d.total / total) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="shrink-0">
        <PieChart width={200} height={200}>
          <Pie
            data={comPct}
            dataKey="total"
            nameKey="categoria"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
          >
            {comPct.map((_, index) => (
              <Cell key={index} fill={CORES[index % CORES.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<TooltipEscuro formatter={(v) => formatarMoeda(Number(v))} />} />
        </PieChart>
      </div>

      <ul className="w-full space-y-2">
        {comPct.map((item, index) => (
          <li
            key={item.categoria}
            className="grid grid-cols-[1fr_auto_48px] items-center gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-foreground/75">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CORES[index % CORES.length] }}
              />
              <span className="truncate">{item.categoria}</span>
            </span>
            <span className="text-right text-foreground/55">{formatarMoeda(item.total)}</span>
            <span className="text-right font-medium text-foreground">
              {item.pct.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
