import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { metaAtualizarSchema } from "@/lib/validacao-meta";

async function buscarMetaDoUsuario(id: string, userId: string) {
  const meta = await prisma.meta.findUnique({ where: { id } });
  if (!meta || meta.userId !== userId) return null;
  return meta;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const existente = await buscarMetaDoUsuario(id, user.id);
  if (!existente) return NextResponse.json({ erro: "Meta não encontrada" }, { status: 404 });

  const body = await request.json();
  const resultado = metaAtualizarSchema.safeParse(body);
  if (!resultado.success) return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });

  const { nome, valorAlvo, dataAlvo } = resultado.data;

  const meta = await prisma.meta.update({
    where: { id },
    data: { nome, valorAlvo, dataAlvo: dataAlvo ? new Date(dataAlvo) : null },
  });

  revalidateTag(`metas-${user.id}`, {});
  return NextResponse.json(meta);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const existente = await buscarMetaDoUsuario(id, user.id);
  if (!existente) return NextResponse.json({ erro: "Meta não encontrada" }, { status: 404 });

  await prisma.meta.delete({ where: { id } });

  revalidateTag(`metas-${user.id}`, {});
  return NextResponse.json({ ok: true });
}
