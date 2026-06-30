"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { TooltipEscuro } from "@/components/tooltip-escuro";

type Ponto = {
  data: string;
  carteira: number;
  ibov: number | null;
  cdi: number;
  ipca: number;
};

export function GraficoComparativo({ dados }: { dados: Ponto[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" vertical={false} />
        <XAxis dataKey="data" tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }} />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--foreground)", opacity: 0.6 }}
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          width={48}
        />
        <Tooltip content={<TooltipEscuro formatter={(v) => `${Number(v).toFixed(2)}%`} />} />
        <Legend wrapperStyle={{ color: "var(--foreground)", opacity: 0.7, fontSize: 13 }} />
        <Line type="monotone" dataKey="carteira" name="Carteira" stroke="#d4af37" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="ibov" name="IBOV" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="cdi" name="CDI" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ipca" name="IPCA" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
