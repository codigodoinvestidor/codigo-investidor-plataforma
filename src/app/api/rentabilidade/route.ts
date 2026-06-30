import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calcularRentabilidadeComparada } from "@/lib/rentabilidade";

const PERIODOS_VALIDOS = [1, 3, 6, 12, 24, 60];

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const periodo = Number(searchParams.get("periodo")) || 12;
  const periodoMeses = PERIODOS_VALIDOS.includes(periodo) ? periodo : 12;

  const ativos = await prisma.ativo.findMany({
    where: { userId: user.id, ticker: { not: null } },
  });

  if (ativos.length === 0) return NextResponse.json({ vazio: true });

  const ativosParaCalculo = ativos.map((a) => ({
    ticker: a.ticker as string,
    quantidade: Number(a.quantidade),
  }));

  const comparativo = await calcularRentabilidadeComparada(ativosParaCalculo, periodoMeses);
  return NextResponse.json(comparativo);
}
