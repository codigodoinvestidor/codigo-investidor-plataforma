import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { gerarCsv } from "@/lib/csv";

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

  const cabecalho = ["Ticker", "Tipo", "Valor", "Data-com", "Data pagamento"];

  const linhas = proventos.map((p) => [
    p.ticker,
    p.tipoPagamento,
    Number(p.valorTotal).toFixed(2).replace(".", ","),
    p.dataCom ? p.dataCom.toLocaleDateString("pt-BR") : "—",
    p.dataPagamento.toLocaleDateString("pt-BR"),
  ]);

  const csv = gerarCsv(cabecalho, linhas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="proventos.csv"`,
    },
  });
}
