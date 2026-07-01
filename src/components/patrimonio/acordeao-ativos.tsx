"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { TIPOS_ATIVO, type TipoAtivo } from "@/lib/ativos";
import { EditarAtivoModal, type AtivoEditavel } from "@/components/patrimonio/editar-ativo-modal";
import { VenderAtivoModal, type AtivoParaVenda } from "@/components/patrimonio/vender-ativo-modal";
import { DetalheGrupoAtivos } from "@/components/patrimonio/detalhe-grupo-ativos";
import type { AtivoComValor } from "@/lib/tipos-patrimonio";

const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function AcordeaoAtivos({
  ativos,
  valorTotalPatrimonio,
  onRefresh,
}: {
  ativos: AtivoComValor[];
  valorTotalPatrimonio: number;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState<AtivoEditavel | null>(null);
  const [vendendo, setVendendo] = useState<AtivoParaVenda | null>(null);
  const [abertos, setAbertos] = useState<Set<TipoAtivo>>(new Set(TIPOS_ATIVO.map((t) => t.valor)));

  async function excluir(id: string) {
    await fetch(`/api/ativos/${id}`, { method: "DELETE" });
    if (onRefresh) onRefresh(); else router.refresh();
  }

  function alternar(tipo: TipoAtivo) {
    setAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(tipo)) novo.delete(tipo);
      else novo.add(tipo);
      return novo;
    });
  }

  const grupos = TIPOS_ATIVO.map((t) => {
    const itens = ativos.filter((a) => a.tipo === t.valor);
    const valorTotal = itens.reduce((s, a) => s + a.valorAtual, 0);
    return { tipo: t.valor, rotulo: t.rotulo, itens, valorTotal };
  })
    .filter((g) => g.itens.length > 0)
    .sort((a, b) => b.valorTotal - a.valorTotal);

  if (grupos.length === 0) {
    return <p className="py-6 text-center text-sm text-foreground/50">Nenhum ativo ainda.</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {grupos.map((grupo) => {
          const aberto = abertos.has(grupo.tipo);
          const pctCarteira =
            valorTotalPatrimonio > 0 ? (grupo.valorTotal / valorTotalPatrimonio) * 100 : 0;

          return (
            <div key={grupo.tipo} className="overflow-hidden rounded-xl border border-borda">
              <button
                type="button"
                onClick={() => alternar(grupo.tipo)}
                className="flex w-full items-center justify-between gap-4 bg-superficie px-4 py-3 text-left transition hover:bg-dourado/5"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={16}
                    className={`text-foreground/40 transition-transform ${aberto ? "rotate-180" : ""}`}
                  />
                  <span className="font-medium text-foreground">{grupo.rotulo}</span>
                  <span className="text-xs text-foreground/45">
                    {grupo.itens.length} ativo{grupo.itens.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <span className="font-semibold text-foreground">
                    {formatarMoeda(grupo.valorTotal)}
                  </span>
                  <span className="hidden text-foreground/55 sm:inline">
                    {pctCarteira.toFixed(1)}% da carteira
                  </span>
                </div>
              </button>

              {aberto && (
                <DetalheGrupoAtivos
                  itens={grupo.itens}
                  valorTotalPatrimonio={valorTotalPatrimonio}
                  onEditar={setEditando}
                  onExcluir={excluir}
                  onVender={setVendendo}
                />
              )}
            </div>
          );
        })}
      </div>

      {editando && <EditarAtivoModal ativo={editando} onFechar={() => setEditando(null)} onRefresh={onRefresh} />}
      {vendendo && <VenderAtivoModal ativo={vendendo} onFechar={() => setVendendo(null)} onRefresh={onRefresh} />}
    </>
  );
}
