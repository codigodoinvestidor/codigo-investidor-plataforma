"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { NOMES_MESES_ABREV } from "@/lib/categorias";
import { EditarLancamentoModal, type LancamentoEditavel } from "@/components/dashboard/editar-lancamento-modal";

function periodo(l: LancamentoEditavel) {
  const inicio = `${NOMES_MESES_ABREV[l.mesInicio - 1]}/${l.anoInicio}`;
  if (l.mesFim == null || l.anoFim == null) return `desde ${inicio}`;
  if (l.mesFim === l.mesInicio && l.anoFim === l.anoInicio) return inicio;
  return `${inicio} – ${NOMES_MESES_ABREV[l.mesFim - 1]}/${l.anoFim}`;
}

export function ListaLancamentos({ lancamentos }: { lancamentos: LancamentoEditavel[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<LancamentoEditavel | null>(null);

  async function excluir(id: string) {
    await fetch(`/api/lancamentos/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (lancamentos.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-foreground/50">Nenhum lançamento ainda.</p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-borda">
        {lancamentos.map((l) => (
          <li key={l.id} className="group flex items-center justify-between gap-4 py-3.5">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  l.tipo === "RENDA"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {l.tipo === "RENDA" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{l.descricao}</p>
                <p className="text-xs text-foreground/50">
                  {l.categoria} · {periodo(l)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold ${
                  l.tipo === "RENDA" ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {l.tipo === "RENDA" ? "+" : "-"}
                {Number(l.valor).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <button
                onClick={() => setEditando(l)}
                className="text-foreground/30 opacity-0 transition group-hover:opacity-100 hover:text-dourado"
                aria-label="Editar lançamento"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => excluir(l.id)}
                className="text-foreground/30 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                aria-label="Excluir lançamento"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <EditarLancamentoModal lancamento={editando} onFechar={() => setEditando(null)} />
      )}
    </>
  );
}
