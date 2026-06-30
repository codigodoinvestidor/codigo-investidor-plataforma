import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calcularTodosPeriodos } from "@/lib/rentabilidade";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const ativos = await prisma.ativo.findMany({
    where: { userId: user.id, ticker: { not: null } },
  });

  if (ativos.length === 0) return NextResponse.json({ vazio: true });

  const ativosParaCalculo = ativos.map((a) => ({
    ticker: a.ticker as string,
    quantidade: Number(a.quantidade),
  }));

  const todos = await calcularTodosPeriodos(ativosParaCalculo);
  return NextResponse.json(todos);
}
