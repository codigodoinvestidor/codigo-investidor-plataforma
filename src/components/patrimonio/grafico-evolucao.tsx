"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Ponto = { mes: string; valorAplicado: number; ganhoCapital: number };

export function GraficoEvolucao({ dados }: { dados: Ponto[] }) {
  const temValor = dados.some((d) => d.valorAplicado > 0);

  if (!temValor) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-foreground/60">
        Cadastre ativos para ver a evolução do patrimônio.
      </p>
    );
  }

  const ultimoGanho = dados[dados.length - 1]?.ganhoCapital ?? 0;
  const corGanho = ultimoGanho >= 0 ? "#34d399" : "#f87171";

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }} />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }}
          tickFormatter={(v: number) => `R$${Math.round(v / 1000)}K`}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "var(--foreground)", opacity: 0.06 }}
          content={<TooltipEscuro formatter={(v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />}
        />
        <Bar
          dataKey="valorAplicado"
          name="Valor aplicado"
          stackId="patrimonio"
          fill="#10b981"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="ganhoCapital"
          name="Ganho de capital"
          stackId="patrimonio"
          fill={corGanho}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
