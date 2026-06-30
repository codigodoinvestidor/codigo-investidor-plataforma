import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { lancamentoAtivoSchema } from "@/lib/validacao-lancamento-ativo";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const lancamentos = await prisma.lancamentoAtivo.findMany({
    where: { userId: user.id },
    orderBy: { dataOperacao: "desc" },
  });

  return NextResponse.json(lancamentos.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    ticker: l.ticker,
    nome: l.nome,
    quantidade: l.quantidade.toString(),
    precoUnitario: l.precoUnitario.toString(),
    valorTotal: l.valorTotal.toString(),
    dataOperacao: l.dataOperacao.toISOString(),
    corretora: l.corretora,
  })));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const resultado = lancamentoAtivoSchema.safeParse(body);
  if (!resultado.success) return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });

  const { dataOperacao, ...rest } = resultado.data;
  const lancamento = await prisma.lancamentoAtivo.create({
    data: { ...rest, dataOperacao: new Date(dataOperacao), userId: user.id },
  });

  return NextResponse.json({ id: lancamento.id }, { status: 201 });
}
