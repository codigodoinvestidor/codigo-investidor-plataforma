"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { EditarLancamentoAtivoModal } from "./editar-lancamento-ativo-modal";

export type LancamentoAtivoItem = {
  id: string;
  tipo: "COMPRA" | "VENDA";
  ticker: string;
  nome: string | null;
  quantidade: string;
  precoUnitario: string;
  valorTotal: string;
  dataOperacao: string;
  corretora: string | null;
};

type Props = { lancamentos: LancamentoAtivoItem[]; onRefresh?: () => void };

const fmt = (v: string) =>
  parseFloat(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ListaLancamentosAtivos({ lancamentos, onRefresh }: Props) {
  const [editando, setEditando] = useState<LancamentoAtivoItem | null>(null);

  async function excluir(id: string) {
    await fetch(`/api/lancamentos-ativos/${id}`, { method: "DELETE" });
    onRefresh?.();
  }

  if (lancamentos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-foreground/50">
        Nenhuma operação registrada. Adicione manualmente ou importe da B3.
      </p>
    );
  }

  // agrupa por ticker para resumo
  const resumoPorTicker = Object.values(
    lancamentos.reduce<Record<string, { ticker: string; qtdLiq: number; totalInvestido: number }>>((acc, l) => {
      const qtd = parseFloat(l.quantidade);
      const valor = parseFloat(l.valorTotal);
      if (!acc[l.ticker]) acc[l.ticker] = { ticker: l.ticker, qtdLiq: 0, totalInvestido: 0 };
      if (l.tipo === "COMPRA") { acc[l.ticker].qtdLiq += qtd; acc[l.ticker].totalInvestido += valor; }
      else { acc[l.ticker].qtdLiq -= qtd; acc[l.ticker].totalInvestido -= valor; }
      return acc;
    }, {})
  ).filter((r) => r.qtdLiq > 0).sort((a, b) => b.totalInvestido - a.totalInvestido);

  return (
    <>
      {resumoPorTicker.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {resumoPorTicker.map((r) => (
            <div key={r.ticker} className="rounded-xl border border-borda bg-foreground/3 p-3">
              <p className="font-mono text-sm font-bold text-foreground">{r.ticker}</p>
              <p className="text-xs text-foreground/50">{r.qtdLiq.toLocaleString("pt-BR")} cotas/ações</p>
              <p className="text-xs text-dourado">{r.totalInvestido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-borda text-xs text-foreground/40">
              <th className="pb-2 text-left">Tipo</th>
              <th className="pb-2 text-left">Ticker</th>
              <th className="pb-2 text-right">Qtd</th>
              <th className="pb-2 text-right">Preço</th>
              <th className="pb-2 text-right">Total</th>
              <th className="pb-2 text-left">Data</th>
              <th className="pb-2 text-left">Corretora</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-borda">
            {lancamentos.map((l) => (
              <tr key={l.id} className="group">
                <td className="py-2.5 pr-3">
                  <span className={`flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    l.tipo === "COMPRA" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {l.tipo === "COMPRA" ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                    {l.tipo === "COMPRA" ? "Compra" : "Venda"}
                  </span>
                </td>
                <td className="py-2.5 pr-3 font-mono font-semibold text-foreground">{l.ticker}</td>
                <td className="py-2.5 pr-3 text-right text-foreground/70">{parseFloat(l.quantidade).toLocaleString("pt-BR")}</td>
                <td className="py-2.5 pr-3 text-right text-foreground/70">{fmt(l.precoUnitario)}</td>
                <td className="py-2.5 pr-3 text-right font-medium text-foreground">{fmt(l.valorTotal)}</td>
                <td className="py-2.5 pr-3 text-foreground/60">{new Date(l.dataOperacao).toLocaleDateString("pt-BR")}</td>
                <td className="py-2.5 pr-3 text-foreground/50">{l.corretora ?? "—"}</td>
                <td className="py-2.5">
                  <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => setEditando(l)} className="text-foreground/30 hover:text-dourado"><Pencil size={14} /></button>
                    <button onClick={() => excluir(l.id)} className="text-foreground/30 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <EditarLancamentoAtivoModal
          lancamento={editando}
          onFechar={() => setEditando(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
