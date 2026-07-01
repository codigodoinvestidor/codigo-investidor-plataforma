import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { lancamentoAtivoSchema } from "@/lib/validacao-lancamento-ativo";
import { sincronizarAtivo, sincronizarAtivoPorId } from "@/lib/sincronizar-ativo";

async function buscar(id: string, userId: string) {
  const l = await prisma.lancamentoAtivo.findUnique({ where: { id } });
  if (!l || l.userId !== userId) return null;
  return l;
}

async function sincronizar(userId: string, ticker: string | null, ativoId: string | null) {
  if (ticker) await sincronizarAtivo(userId, ticker);
  else if (ativoId) await sincronizarAtivoPorId(userId, ativoId);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const existente = await buscar(id, user.id);
  if (!existente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  const body = await request.json();
  const resultado = lancamentoAtivoSchema.safeParse(body);
  if (!resultado.success) return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });

  const { dataOperacao, ticker, ...rest } = resultado.data;
  // Lançamentos sem ticker (agrupados por ativoId) nunca ganham um ticker na edição
  const novoTicker = existente.ticker ? (ticker ?? existente.ticker) : null;

  const lancamento = await prisma.lancamentoAtivo.update({
    where: { id },
    data: { ...rest, ticker: novoTicker, ativoId: existente.ativoId, dataOperacao: new Date(dataOperacao) },
  });

  // Se o ticker mudou, sincroniza os dois lados
  if (existente.ticker !== lancamento.ticker) {
    await sincronizar(user.id, existente.ticker, existente.ativoId);
  }
  await sincronizar(user.id, lancamento.ticker, lancamento.ativoId);

  return NextResponse.json({ id: lancamento.id });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const existente = await buscar(id, user.id);
  if (!existente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  await prisma.lancamentoAtivo.delete({ where: { id } });
  await sincronizar(user.id, existente.ticker, existente.ativoId);

  return NextResponse.json({ ok: true });
}
