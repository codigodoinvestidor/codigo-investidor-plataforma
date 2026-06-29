import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { lancamentoSchema } from "@/lib/validacao";

async function buscarLancamentoDoUsuario(id: string, userId: string) {
  const lancamento = await prisma.lancamentoFinanceiro.findUnique({ where: { id } });
  if (!lancamento || lancamento.userId !== userId) return null;
  return lancamento;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const existente = await buscarLancamentoDoUsuario(id, user.id);
  if (!existente) {
    return NextResponse.json({ erro: "Lançamento não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const resultado = lancamentoSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });
  }

  const lancamento = await prisma.lancamentoFinanceiro.update({
    where: { id },
    data: resultado.data,
  });

  return NextResponse.json(lancamento);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const existente = await buscarLancamentoDoUsuario(id, user.id);
  if (!existente) {
    return NextResponse.json({ erro: "Lançamento não encontrado" }, { status: 404 });
  }

  await prisma.lancamentoFinanceiro.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
