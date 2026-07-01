export type ProventoCalculo = {
  ticker: string;
  valorTotal: number;
  dataPagamento: Date;
};

const NOMES_MES_ANO = (data: Date) =>
  `${String(data.getMonth() + 1).padStart(2, "0")}/${String(data.getFullYear()).slice(2)}`;

export function evolucaoProventos(proventos: ProventoCalculo[], meses = 12) {
  const hoje = new Date();
  const pontos: { mes: string; total: number }[] = [];

  for (let i = meses - 1; i >= 0; i--) {
    const referencia = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const total = proventos
      .filter(
        (p) =>
          p.dataPagamento.getFullYear() === referencia.getFullYear() &&
          p.dataPagamento.getMonth() === referencia.getMonth()
      )
      .reduce((s, p) => s + p.valorTotal, 0);

    pontos.push({ mes: NOMES_MES_ANO(referencia), total });
  }

  return pontos;
}

// Total recebido nos últimos 12 meses e a média mensal correspondente —
// usado no cartão de resumo de Proventos e na meta de dividendos em Metas.
export function mediaMensal12Meses(proventos: ProventoCalculo[]) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const recebidos12m = proventos.filter((p) => {
    const diffMeses = (anoAtual - p.dataPagamento.getFullYear()) * 12 + (mesAtual - p.dataPagamento.getMonth());
    return diffMeses >= 0 && diffMeses < 12;
  });
  const total12Meses = recebidos12m.reduce((s, p) => s + p.valorTotal, 0);

  const recebidoMesAtual = proventos
    .filter((p) => p.dataPagamento.getFullYear() === anoAtual && p.dataPagamento.getMonth() === mesAtual)
    .reduce((s, p) => s + p.valorTotal, 0);

  return { total12Meses, mediaMensal: total12Meses / 12, recebidoMesAtual };
}

export function resumoAnualProventos(proventos: ProventoCalculo[], ano: number) {
  const meses = Array.from({ length: 12 }, (_, i) => {
    const total = proventos
      .filter((p) => p.dataPagamento.getFullYear() === ano && p.dataPagamento.getMonth() === i)
      .reduce((s, p) => s + p.valorTotal, 0);
    return { mes: i + 1, total };
  });

  const totalAno = meses.reduce((s, m) => s + m.total, 0);
  const mediaAno = (() => {
    const comValor = meses.filter((m) => m.total > 0);
    return comValor.length > 0 ? comValor.reduce((s, m) => s + m.total, 0) / comValor.length : 0;
  })();

  return { meses, totalAno, mediaAno };
}

export function distribuicaoPorTicker(proventos: ProventoCalculo[]) {
  const mapa = new Map<string, number>();
  for (const p of proventos) {
    mapa.set(p.ticker, (mapa.get(p.ticker) ?? 0) + p.valorTotal);
  }
  return Array.from(mapa, ([categoria, total]) => ({ categoria, total }));
}
