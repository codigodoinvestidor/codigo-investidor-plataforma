import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { gerarCsv } from "@/lib/csv";
import { rotuloTipoAtivo } from "@/lib/ativos";
import { obterCotacoesEmCache } from "@/lib/cotacoes";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  const ativos = await prisma.ativo.findMany({
    where: { userId: user.id },
    orderBy: { criadoEm: "desc" },
  });

  const tickers = ativos.map((a) => a.ticker).filter((t): t is string => Boolean(t));
  const cotacoesCache = await obterCotacoesEmCache(tickers);

  const cabecalho = [
    "Tipo",
    "Ticker",
    "Nome",
    "Quantidade",
    "Preço de compra",
    "Preço atual",
    "Valor de compra",
    "Valor atual",
    "Ganho/Perda",
    "Rentabilidade %",
    "Data da compra",
  ];

  const formatarNumero = (v: number) => v.toFixed(2).replace(".", ",");

  const linhas = ativos.map((a) => {
    const quantidade = Number(a.quantidade);
    const valorCompraUnitario = Number(a.valorCompraUnitario);
    const valorCompra = quantidade * valorCompraUnitario;
    const precoAtual = (a.ticker ? cotacoesCache.get(a.ticker)?.preco : undefined) ?? valorCompraUnitario;
    const valorAtual = quantidade * precoAtual;
    const ganho = valorAtual - valorCompra;
    const rentabilidadePct = valorCompra > 0 ? (ganho / valorCompra) * 100 : 0;

    return [
      rotuloTipoAtivo(a.tipo),
      a.ticker ?? "—",
      a.nome,
      formatarNumero(quantidade),
      formatarNumero(valorCompraUnitario),
      formatarNumero(precoAtual),
      formatarNumero(valorCompra),
      formatarNumero(valorAtual),
      formatarNumero(ganho),
      formatarNumero(rentabilidadePct),
      a.dataCompra.toLocaleDateString("pt-BR"),
    ];
  });

  const csv = gerarCsv(cabecalho, linhas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ativos.csv"`,
    },
  });
}
