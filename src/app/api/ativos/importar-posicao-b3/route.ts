import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type AtivoImport = {
  tipo: "ACAO" | "FII" | "ETF";
  ticker: string;
  nome: string;
  quantidade: number;
  valorCompraUnitario: number;
  dataCompra: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { ativos } = await request.json() as { ativos: AtivoImport[] };
  if (!ativos?.length) return NextResponse.json({ erro: "Nenhum ativo encontrado" }, { status: 400 });

  // Tickers já cadastrados para evitar duplicatas
  const existentes = await prisma.ativo.findMany({
    where: { userId: user.id, ticker: { in: ativos.map((a) => a.ticker) } },
    select: { ticker: true },
  });
  const tickersExistentes = new Set(existentes.map((e) => e.ticker));
  const novos = ativos.filter((a) => !tickersExistentes.has(a.ticker));

  if (novos.length === 0) {
    return NextResponse.json({ importados: 0, ignorados: ativos.length, mensagem: "Todos os tickers já estão cadastrados" });
  }

  await prisma.ativo.createMany({
    data: novos.map((a) => ({
      userId: user.id,
      tipo: a.tipo,
      ticker: a.ticker,
      nome: a.nome,
      quantidade: a.quantidade,
      valorCompraUnitario: a.valorCompraUnitario,
      dataCompra: new Date(a.dataCompra),
      percentualIdeal: null,
    })),
  });

  revalidateTag(`ativos-${user.id}`, {});
  return NextResponse.json({ importados: novos.length, ignorados: tickersExistentes.size });
}
