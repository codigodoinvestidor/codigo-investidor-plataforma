import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { lancamentoSchema } from "@/lib/validacao";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where: { userId: user.id },
    orderBy: [{ anoInicio: "desc" }, { mesInicio: "desc" }],
  });

  return NextResponse.json(lancamentos);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const resultado = lancamentoSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });
  }

  const lancamento = await prisma.lancamentoFinanceiro.create({
    data: { ...resultado.data, userId: user.id },
  });

  revalidateTag(`lancamentos-${user.id}`, {});
  return NextResponse.json(lancamento, { status: 201 });
}
