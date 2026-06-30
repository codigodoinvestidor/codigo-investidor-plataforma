"use client";

import { useState } from "react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { NovoLancamentoAtivoForm } from "./novo-lancamento-ativo-form";
import { ImportarB3Modal } from "./importar-b3-modal";
import { ListaLancamentosAtivos } from "./lista-lancamentos-ativos";
import type { LancamentoAtivoItem } from "./lista-lancamentos-ativos";

type Props = { initialData?: LancamentoAtivoItem[] };

export function LancamentosAtivosContent({ initialData }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);

  const { data, loading, refresh } = useCachedFetch<LancamentoAtivoItem[]>(
    "lancamentos-ativos",
    async () => {
      const res = await fetch("/api/lancamentos-ativos");
      if (!res.ok) throw new Error("Erro ao carregar");
      return res.json();
    },
    initialData
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
        {loading && !data ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-foreground/5" />
            ))}
          </div>
        ) : (
          <ListaLancamentosAtivos lancamentos={data ?? []} onRefresh={refresh} />
        )}
      </div>
    </div>
  );
}
