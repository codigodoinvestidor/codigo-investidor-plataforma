import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parsearCsvB3 } from "@/lib/b3-csv";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const { csv } = body as { csv: string };

  if (!csv) return NextResponse.json({ erro: "CSV vazio" }, { status: 400 });

  const linhas = parsearCsvB3(csv);
  if (linhas.length === 0) return NextResponse.json({ erro: "Nenhuma operação encontrada no arquivo" }, { status: 400 });

  await prisma.lancamentoAtivo.createMany({
    data: linhas.map((l) => ({ ...l, userId: user.id })),
    skipDuplicates: false,
  });

  return NextResponse.json({ importados: linhas.length });
}
