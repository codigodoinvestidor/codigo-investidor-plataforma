import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ erro: "userId inválido" }, { status: 400 });
  }

  await prisma.$executeRaw`
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('aprovado', true)
    where id::text = ${userId}
  `;

  revalidateTag("admin-usuarios", {});
  revalidateTag("admin-usuarios-pendentes", {});

  return NextResponse.json({ ok: true });
}
