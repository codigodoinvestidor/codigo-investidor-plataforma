import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { proventoSchema } from "@/lib/validacao-provento";

async function buscarProventoDoUsuario(id: string, userId: string) {
  const provento = await prisma.provento.findUnique({ where: { id } });
  if (!provento || provento.userId !== userId) return null;
  return provento;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const existente = await buscarProventoDoUsuario(id, user.id);
  if (!existente) {
    return NextResponse.json({ erro: "Provento não encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const resultado = proventoSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });
  }

  const provento = await prisma.provento.update({
    where: { id },
    data: resultado.data,
  });

  return NextResponse.json(provento);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const existente = await buscarProventoDoUsuario(id, user.id);
  if (!existente) {
    return NextResponse.json({ erro: "Provento não encontrado" }, { status: 404 });
  }

  await prisma.provento.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
