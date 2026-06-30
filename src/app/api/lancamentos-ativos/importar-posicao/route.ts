import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sincronizarAtivo } from "@/lib/sincronizar-ativo";

type LancamentoImport = {
  tipo: "COMPRA" | "VENDA";
  ticker: string;
  nome: string | null;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  dataOperacao: string;
  corretora: string | null;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { lancamentos } = await request.json() as { lancamentos: LancamentoImport[] };
  if (!lancamentos?.length) return NextResponse.json({ erro: "Nenhum lançamento enviado" }, { status: 400 });

  await prisma.lancamentoAtivo.createMany({
    data: lancamentos.map((l) => ({
      userId: user.id,
      tipo: l.tipo,
      ticker: l.ticker,
      nome: l.nome,
      quantidade: l.quantidade,
      precoUnitario: l.precoUnitario,
      valorTotal: l.valorTotal,
      dataOperacao: new Date(l.dataOperacao),
      corretora: l.corretora,
    })),
    skipDuplicates: false,
  });

  // Sync todos os tickers importados para o Patrimônio
  const tickers = [...new Set(lancamentos.map((l) => l.ticker))];
  await Promise.all(tickers.map((t) => sincronizarAtivo(user.id, t)));

  return NextResponse.json({ importados: lancamentos.length });
}
