import type { AtivoEditavel } from "@/components/patrimonio/editar-ativo-modal";

export type AtivoComValor = Omit<AtivoEditavel, "percentualIdeal"> & {
  precoAtual: number;
  valorAtual: number;
  valorCompra: number;
  ganho: number;
  rentabilidadePct: number;
  temCotacao: boolean;
  variacaoDia: number | null;
  percentualIdeal: number | null;
};

export function paraAtivoEditavel(a: AtivoComValor): AtivoEditavel {
  return { ...a, percentualIdeal: a.percentualIdeal != null ? String(a.percentualIdeal) : null };
}
