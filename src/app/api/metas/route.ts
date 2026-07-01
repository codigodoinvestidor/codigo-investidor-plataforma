import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { metaSchema } from "@/lib/validacao-meta";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const metas = await prisma.meta.findMany({
    where: { userId: user.id },
    orderBy: { criadoEm: "asc" },
  });
  return NextResponse.json(metas);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const resultado = metaSchema.safeParse(body);
  if (!resultado.success) return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });

  const { tipo, nome, valorAlvo, dataAlvo } = resultado.data;

  const meta = await prisma.meta.create({
    data: { userId: user.id, tipo, nome, valorAlvo, dataAlvo: dataAlvo ? new Date(dataAlvo) : null },
  });

  revalidateTag(`metas-${user.id}`, {});
  return NextResponse.json(meta, { status: 201 });
}
