import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const userAgent = request.headers.get("user-agent");

  await prisma.acessoLog.create({
    data: { userId: user.id, userAgent },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
