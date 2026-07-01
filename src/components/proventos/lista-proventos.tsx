"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  EditarProventoModal,
  type ProventoEditavel,
} from "@/components/proventos/editar-provento-modal";

const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ListaProventos({ proventos, onRefresh }: { proventos: ProventoEditavel[]; onRefresh?: () => void }) {
  const router = useRouter();
  const [editando, setEditando] = useState<ProventoEditavel | null>(null);
  const hoje = new Date();

  async function excluir(id: string) {
    await fetch(`/api/proventos/${id}`, { method: "DELETE" });
    if (onRefresh) onRefresh(); else router.refresh();
  }

  if (proventos.length === 0) {
    return <p className="py-6 text-center text-sm text-foreground/50">Nenhum provento ainda.</p>;
  }

  return (
    <>
      <div className="scrollbar-fina overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-foreground/40">
              <th className="py-2 pr-2">Ativo</th>
              <th className="px-2 py-2">Tipo</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Data pagamento</th>
              <th className="px-2 py-2 text-right">Valor</th>
              <th className="py-2 pl-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-borda">
            {proventos.map((p) => {
              const recebido = new Date(p.dataPagamento) <= hoje;
              return (
                <tr key={p.id} className="group">
                  <td className="py-2.5 pr-2 font-medium text-foreground">{p.ticker}</td>
                  <td className="px-2 py-2.5 text-foreground/70">{p.tipoPagamento}</td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        recebido
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-dourado/10 text-dourado"
                      }`}
                    >
                      {recebido ? "Recebido" : "A receber"}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-foreground/70">
                    {formatarData(p.dataPagamento)}
                  </td>
                  <td className="px-2 py-2.5 text-right font-medium text-emerald-500">
                    {formatarMoeda(Number(p.valorTotal))}
                  </td>
                  <td className="py-2.5 pl-2">
                    <div className="flex items-center justify-end gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={() => setEditando(p)}
                        className="text-foreground/40 hover:text-dourado"
                        aria-label="Editar provento"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => excluir(p.id)}
                        className="text-foreground/40 hover:text-red-500"
                        aria-label="Excluir provento"
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

      {editando && (
        <EditarProventoModal provento={editando} onFechar={() => setEditando(null)} onRefresh={onRefresh} />
      )}
    </>
  );
}
