import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LancamentosAtivosContent } from "@/components/lancamentos-ativos/lancamentos-ativos-content";
import type { LancamentoAtivoItem } from "@/components/lancamentos-ativos/lista-lancamentos-ativos";
import type { AtivoPatrimonioItem } from "@/components/lancamentos-ativos/lancamentos-ativos-content";

export default async function LancamentosAtivosPage() {
  const user = await getUser();

  const [lancamentos, ativos] = await Promise.all([
    prisma.lancamentoAtivo.findMany({
      where: { userId: user!.id },
      orderBy: { dataOperacao: "desc" },
    }),
    prisma.ativo.findMany({
      where: { userId: user!.id, tipo: { in: ["ACAO", "FII", "ETF"] } },
      orderBy: { criadoEm: "desc" },
    }),
  ]);

  const initialLancamentos: LancamentoAtivoItem[] = lancamentos.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    ticker: l.ticker,
    nome: l.nome ?? null,
    quantidade: l.quantidade.toString(),
    precoUnitario: l.precoUnitario.toString(),
    valorTotal: l.valorTotal.toString(),
    dataOperacao: new Date(l.dataOperacao).toISOString(),
    corretora: l.corretora ?? null,
  }));

  const initialAtivos: AtivoPatrimonioItem[] = ativos.map((a) => ({
    id: a.id,
    ticker: a.ticker ?? "",
    nome: a.nome,
    tipo: a.tipo,
    quantidade: a.quantidade.toString(),
    valorCompraUnitario: a.valorCompraUnitario.toString(),
    dataCompra: new Date(a.dataCompra).toISOString(),
  }));

  return <LancamentosAtivosContent initialLancamentos={initialLancamentos} initialAtivos={initialAtivos} />;
}
