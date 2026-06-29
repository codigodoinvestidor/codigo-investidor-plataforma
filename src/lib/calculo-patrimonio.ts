const NOMES_MES_ANO = (data: Date) =>
  `${String(data.getMonth() + 1).padStart(2, "0")}/${String(data.getFullYear()).slice(2)}`;

export type AtivoParaEvolucao = {
  quantidade: number;
  valorCompraUnitario: number;
  dataCompra: Date;
};

export function evolucaoValorAplicado(ativos: AtivoParaEvolucao[], meses = 12) {
  const hoje = new Date();
  const pontos: { mes: string; valorAplicado: number; ganhoCapital: number }[] = [];

  for (let i = meses - 1; i >= 0; i--) {
    const referencia = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const fimDoMes = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);

    const valorAplicado = ativos
      .filter((a) => a.dataCompra <= fimDoMes)
      .reduce((soma, a) => soma + a.quantidade * a.valorCompraUnitario, 0);

    pontos.push({ mes: NOMES_MES_ANO(referencia), valorAplicado, ganhoCapital: 0 });
  }

  return pontos;
}
