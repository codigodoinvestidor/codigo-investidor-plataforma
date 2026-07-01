"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Item = { categoria: string; total: number };

const CORES = ["#3b82f6", "#10b981", "#d4af37", "#ef4444", "#06b6d4", "#a855f7", "#f97316"];

function formatarPct(v: number) {
  return `${v.toFixed(2)}%`;
}

export function GraficoAlocacao({ dados }: { dados: Item[] }) {
  if (dados.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-foreground/60">
        Nenhum ativo cadastrado ainda.
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
      <PieChart width={220} height={220}>
          <Pie
            data={comPct}
            dataKey="total"
            nameKey="categoria"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={1}
          >
            {comPct.map((_, index) => (
              <Cell key={index} fill={CORES[index % CORES.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<TooltipEscuro formatter={(v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />} />
      </PieChart>
      </div>

      <ul className="w-full space-y-2">
        {comPct.map((item, index) => (
          <li key={item.categoria} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CORES[index % CORES.length] }}
            />
            <span className="text-foreground/75">{item.categoria}</span>
            <span className="font-medium text-foreground">{formatarPct(item.pct)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
