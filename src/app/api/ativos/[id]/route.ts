import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ativoSchema } from "@/lib/validacao-ativo";

async function buscarAtivoDoUsuario(id: string, userId: string) {
  const ativo = await prisma.ativo.findUnique({ where: { id } });
  if (!ativo || ativo.userId !== userId) return null;
  return ativo;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const existente = await buscarAtivoDoUsuario(id, user.id);
  if (!existente) {
    return NextResponse.json({ erro: "Ativo não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const resultado = ativoSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });
  }

  const ativo = await prisma.ativo.update({
    where: { id },
    data: resultado.data,
  });

  revalidateTag(`ativos-${user.id}`, {});
  return NextResponse.json(ativo);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const existente = await buscarAtivoDoUsuario(id, user.id);
  if (!existente) {
    return NextResponse.json({ erro: "Ativo não encontrado" }, { status: 404 });
  }

  await prisma.ativo.delete({ where: { id } });

  revalidateTag(`ativos-${user.id}`, {});
  return NextResponse.json({ ok: true });
}
