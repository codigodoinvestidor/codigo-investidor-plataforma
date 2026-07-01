import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ativoSchema } from "@/lib/validacao-ativo";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const ativos = await prisma.ativo.findMany({
    where: { userId: user.id },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(ativos);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const resultado = ativoSchema.safeParse(body);
  if (!resultado.success) return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });

  const ativo = await prisma.ativo.create({
    data: { ...resultado.data, userId: user.id },
  });

  // Todo ativo criado no Patrimônio gera um lançamento COMPRA correspondente
  // em Lançamentos — ativos com ticker são agrupados por ticker, os demais
  // (veículo, imóvel, renda fixa, outro) por ativoId.
  const qtd = Number(ativo.quantidade);
  const preco = Number(ativo.valorCompraUnitario);
  await prisma.lancamentoAtivo.create({
    data: {
      userId: user.id,
      tipo: "COMPRA",
      ticker: ativo.ticker,
      ativoId: ativo.ticker ? null : ativo.id,
      nome: ativo.nome,
      quantidade: qtd,
      precoUnitario: preco,
      valorTotal: qtd * preco,
      dataOperacao: ativo.dataCompra,
      corretora: null,
    },
  });

  revalidateTag(`ativos-${user.id}`, {});
  return NextResponse.json(ativo, { status: 201 });
}
