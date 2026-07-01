"use client";

import { useState } from "react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { NovoLancamentoAtivoForm } from "./novo-lancamento-ativo-form";
import { ImportarB3Modal } from "./importar-b3-modal";
import { ListaLancamentosAtivos } from "./lista-lancamentos-ativos";
import type { LancamentoAtivoItem } from "./lista-lancamentos-ativos";

export type AtivoPatrimonioItem = {
  id: string;
  ticker: string;
  nome: string;
  tipo: string;
  quantidade: string;
  valorCompraUnitario: string;
  dataCompra: string;
};

type Props = {
  initialLancamentos?: LancamentoAtivoItem[];
  initialAtivos?: AtivoPatrimonioItem[];
};

const fmt = (v: string | number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function SecaoPatrimonio({ ativos }: { ativos: AtivoPatrimonioItem[] }) {
  if (ativos.length === 0) return null;
  return (
    <div className="card p-6">
      <h2 className="mb-1 font-display text-lg text-foreground">Posição atual (Patrimônio)</h2>
      <p className="mb-4 text-sm text-foreground/50">Ativos cadastrados diretamente no Patrimônio.</p>
      <div className="scrollbar-fina overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-borda text-xs text-foreground/40">
              <th className="px-3 pb-2 text-center">Ticker</th>
              <th className="px-3 pb-2 text-center">Nome</th>
              <th className="px-3 pb-2 text-center">Tipo</th>
              <th className="px-3 pb-2 text-center">Qtd</th>
              <th className="px-3 pb-2 text-center">Preço compra</th>
              <th className="px-3 pb-2 text-center">Total</th>
              <th className="px-3 pb-2 text-center">Data compra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borda">
            {ativos.map((a) => {
              const total = Number(a.quantidade) * Number(a.valorCompraUnitario);
              return (
                <tr key={a.id}>
                  <td className="px-3 py-2.5 text-center font-mono font-semibold text-foreground">{a.ticker}</td>
                  <td className="px-3 py-2.5 text-center text-foreground/70">{a.nome}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="rounded-full bg-dourado/10 px-2 py-0.5 text-xs text-dourado">{a.tipo}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-foreground/70">{Number(a.quantidade).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2.5 text-center text-foreground/70">{fmt(a.valorCompraUnitario)}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-foreground">{fmt(total)}</td>
                  <td className="px-3 py-2.5 text-center text-foreground/50">{new Date(a.dataCompra).toLocaleDateString("pt-BR")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LancamentosAtivosContent({ initialLancamentos, initialAtivos }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);

  const { data: lancamentos, loading, refresh } = useCachedFetch<LancamentoAtivoItem[]>(
    "lancamentos-ativos",
    async () => {
      const res = await fetch("/api/lancamentos-ativos");
      if (!res.ok) throw new Error("Erro ao carregar");
      return res.json();
    },
    initialLancamentos
  );

  const { data: ativos } = useCachedFetch<AtivoPatrimonioItem[]>(
    "ativos-patrimonio-lancamentos",
    async () => {
      const res = await fetch("/api/ativos");
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((a: AtivoPatrimonioItem) => ["ACAO", "FII", "ETF"].includes(a.tipo));
    },
    initialAtivos
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Lançamentos</h1>
          <p className="text-sm text-foreground/50">Histórico de compras e vendas de ações e FIIs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportarB3Modal onSuccess={refresh} />
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="btn-primary"
          >
            {mostrarForm ? "Cancelar" : "+ Nova operação"}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <NovoLancamentoAtivoForm onSuccess={() => { setMostrarForm(false); refresh(); }} />
      )}

      <div className="card p-6">
        <h2 className="mb-1 font-display text-lg text-foreground">Operações registradas</h2>
        <p className="mb-4 text-sm text-foreground/50">Compras e vendas lançadas manualmente ou via importação B3.</p>
        {loading && !lancamentos ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-foreground/5" />
            ))}
          </div>
        ) : (
          <ListaLancamentosAtivos lancamentos={lancamentos ?? []} onRefresh={refresh} />
        )}
      </div>

      <SecaoPatrimonio ativos={ativos ?? []} />
    </div>
  );
}
