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
