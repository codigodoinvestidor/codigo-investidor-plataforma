import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LancamentosAtivosContent } from "@/components/lancamentos-ativos/lancamentos-ativos-content";
import type { LancamentoAtivoItem } from "@/components/lancamentos-ativos/lista-lancamentos-ativos";

export default async function LancamentosAtivosPage() {
  const user = await getUser();
  const lancamentos = await prisma.lancamentoAtivo.findMany({
    where: { userId: user!.id },
    orderBy: { dataOperacao: "desc" },
  });
  const initialData: LancamentoAtivoItem[] = lancamentos.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    ticker: l.ticker,
    nome: l.nome ?? null,
    quantidade: l.quantidade.toString(),
    precoUnitario: l.precoUnitario.toString(),
    valorTotal: l.valorTotal.toString(),
    dataOperacao: l.dataOperacao.toISOString(),
    corretora: l.corretora ?? null,
  }));
  return <LancamentosAtivosContent initialData={initialData} />;
}
