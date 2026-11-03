"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Item = { nome: string; total: number };

const CORES = ["#3b82f6", "#10b981", "#d4af37", "#ef4444", "#a855f7"];

export function GraficoDistribuicao({ dados }: { dados: Item[] }) {
  const comDados = dados.filter((d) => d.total > 0);

  if (comDados.length === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-sm text-foreground/60">
        Nenhum dado cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="shrink-0">
        <PieChart width={180} height={180}>
          <Pie
            data={comDados}
            dataKey="total"
            nameKey="nome"
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={78}
            paddingAngle={2}
          >
            {comDados.map((_, index) => (
              <Cell key={index} fill={CORES[index % CORES.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<TooltipEscuro formatter={(v) => String(v)} />} />
        </PieChart>
      </div>

      <ul className="w-full space-y-2">
        {comDados.map((item, index) => (
          <li key={item.nome} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-foreground/75">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CORES[index % CORES.length] }}
              />
              <span className="truncate">{item.nome}</span>
            </span>
            <span className="text-right font-medium text-foreground">{item.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
