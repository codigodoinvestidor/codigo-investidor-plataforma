"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Pencil, Trash2 } from "lucide-react";
import type { AtivoEditavel } from "@/components/patrimonio/editar-ativo-modal";
import { paraAtivoEditavel, type AtivoComValor } from "@/lib/tipos-patrimonio";

const CORES = ["#3b82f6", "#10b981", "#d4af37", "#ef4444", "#06b6d4", "#a855f7", "#f97316", "#ec4899"];

const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function DetalheGrupoAtivos({
  itens,
  valorTotalPatrimonio,
  onEditar,
  onExcluir,
}: {
  itens: AtivoComValor[];
  valorTotalPatrimonio: number;
  onEditar: (a: AtivoEditavel) => void;
  onExcluir: (id: string) => void;
}) {
  const comValor = [...itens].sort((a, b) => b.valorAtual - a.valorAtual);

  return (
    <div className="flex flex-col gap-6 border-t border-borda px-4 py-4 sm:flex-row">
      <div className="shrink-0">
        <PieChart width={160} height={160}>
          <Pie
            data={comValor}
            dataKey="valorAtual"
            nameKey="nome"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={1}
          >
            {comValor.map((_, index) => (
              <Cell key={index} fill={CORES[index % CORES.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
        </PieChart>
      </div>

      <div className="scrollbar-fina flex-1 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="text-center text-xs uppercase tracking-wide text-foreground/40">
              <th className="px-3 py-2 text-left">Ativo</th>
              <th className="px-3 py-2 text-right">Saldo</th>
              <th className="px-3 py-2 text-right">Dia</th>
              <th className="px-3 py-2 text-right">Rentab.</th>
              <th className="px-3 py-2 text-right">% Carteira</th>
              <th className="px-3 py-2 text-right">% Ideal</th>
              <th className="px-3 py-2">Comprar?</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-borda">
            {comValor.map((a, index) => {
              const pct = valorTotalPatrimonio > 0 ? (a.valorAtual / valorTotalPatrimonio) * 100 : 0;
              const temIdeal = a.percentualIdeal != null;
              const precisaComprar = temIdeal && pct < a.percentualIdeal!;

              return (
                <tr key={a.id} className="group">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: CORES[index % CORES.length] }}
                      />
                      <span className="truncate font-medium text-foreground">
                        {a.ticker ?? a.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-foreground/70">
                    {formatarMoeda(a.valorAtual)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {a.variacaoDia != null ? (
                      <span className={a.variacaoDia >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {a.variacaoDia >= 0 ? "+" : ""}
                        {a.variacaoDia.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {a.temCotacao ? (
                      <span
                        className={a.rentabilidadePct >= 0 ? "text-emerald-500" : "text-red-500"}
                      >
                        {a.rentabilidadePct >= 0 ? "+" : ""}
                        {a.rentabilidadePct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-foreground/70">{pct.toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-right text-foreground/55">
                    {temIdeal ? `${a.percentualIdeal!.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {temIdeal ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          precisaComprar
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {precisaComprar ? "Sim" : "Não"}
                      </span>
                    ) : (
                      <span className="text-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={() => onEditar(paraAtivoEditavel(a))}
                        className="text-foreground/40 hover:text-dourado"
                        aria-label="Editar ativo"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onExcluir(a.id)}
                        className="text-foreground/40 hover:text-red-500"
                        aria-label="Excluir ativo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
