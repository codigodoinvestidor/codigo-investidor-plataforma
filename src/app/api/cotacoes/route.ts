import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const ativos = await prisma.ativo.findMany({
    where: { userId: user.id, ticker: { not: null } },
    select: { ticker: true },
    distinct: ["ticker"],
  });

  const tickers = ativos.map((a) => a.ticker).filter(Boolean) as string[];
  if (tickers.length === 0) return NextResponse.json({});

  const cotacoes = await prisma.cotacaoAtivo.findMany({
    where: { ticker: { in: tickers } },
  });

  const resultado: Record<string, { preco: number; variacaoDia: number | null }> = {};
  for (const c of cotacoes) {
    resultado[c.ticker] = {
      preco: Number(c.preco),
      variacaoDia: c.variacaoDia ? Number(c.variacaoDia) : null,
    };
  }

  return NextResponse.json(resultado);
}
