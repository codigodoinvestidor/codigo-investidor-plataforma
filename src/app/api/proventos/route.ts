import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { proventoSchema } from "@/lib/validacao-provento";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const proventos = await prisma.provento.findMany({
    where: { userId: user.id },
    orderBy: { dataPagamento: "desc" },
  });

  return NextResponse.json(proventos);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const resultado = proventoSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json({ erro: resultado.error.flatten() }, { status: 400 });
  }

  const provento = await prisma.provento.create({
    data: { ...resultado.data, userId: user.id },
  });

  revalidateTag(`proventos-${user.id}`);
  return NextResponse.json(provento, { status: 201 });
}
