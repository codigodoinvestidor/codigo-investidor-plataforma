import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { gerarCsv } from "@/lib/csv";
import { NOMES_MESES } from "@/lib/categorias";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where: { userId: user.id },
    orderBy: [{ anoInicio: "desc" }, { mesInicio: "desc" }],
  });

  const cabecalho = [
    "Tipo",
    "Categoria",
    "Descrição",
    "Valor",
    "Mês início",
    "Ano início",
    "Mês término",
    "Ano término",
  ];

  const linhas = lancamentos.map((l) => [
    l.tipo === "RENDA" ? "Renda" : "Despesa",
    l.categoria,
    l.descricao,
    Number(l.valor).toFixed(2).replace(".", ","),
    NOMES_MESES[l.mesInicio - 1],
    l.anoInicio,
    l.mesFim ? NOMES_MESES[l.mesFim - 1] : "—",
    l.anoFim ?? "—",
  ]);

  const csv = gerarCsv(cabecalho, linhas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lancamentos.csv"`,
    },
  });
}
