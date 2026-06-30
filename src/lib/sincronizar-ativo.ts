import { prisma } from "@/lib/prisma";

// Recalcula a posição do ativo com base em todos os lançamentos do ticker.
// Chamado sempre que um lancamentoAtivo é criado, editado ou excluído.
export async function sincronizarAtivo(userId: string, ticker: string) {
  const lancamentos = await prisma.lancamentoAtivo.findMany({
    where: { userId, ticker: ticker.toUpperCase() },
  });

  let qtdLiquida = 0;
  let custoTotal = 0;

  for (const l of lancamentos) {
    const qtd = Number(l.quantidade);
    const valor = Number(l.valorTotal);
    if (l.tipo === "COMPRA") {
      qtdLiquida += qtd;
      custoTotal += valor;
    } else {
      qtdLiquida -= qtd;
      custoTotal -= valor;
    }
  }

  const existente = await prisma.ativo.findFirst({
    where: { userId, ticker: ticker.toUpperCase() },
  });

  if (qtdLiquida <= 0) {
    if (existente) await prisma.ativo.delete({ where: { id: existente.id } });
    return;
  }

  const precoMedio = custoTotal > 0 ? custoTotal / qtdLiquida : existente?.valorCompraUnitario ?? 1;
  const nome = lancamentos.findLast((l) => l.nome)?.nome ?? existente?.nome ?? ticker;

  if (existente) {
    await prisma.ativo.update({
      where: { id: existente.id },
      data: { quantidade: qtdLiquida, valorCompraUnitario: precoMedio },
    });
  } else {
    // Determina tipo baseado no sufixo do ticker (heurística simples)
    const tipo = /\d{2}$/.test(ticker) && !ticker.startsWith("ETF")
      ? ticker.endsWith("11") ? "FII" : "ACAO"
      : "ACAO";
    await prisma.ativo.create({
      data: {
        userId,
        tipo,
        ticker: ticker.toUpperCase(),
        nome,
        quantidade: qtdLiquida,
        valorCompraUnitario: precoMedio,
        dataCompra: lancamentos[0]?.dataOperacao ?? new Date(),
      },
    });
  }
}
