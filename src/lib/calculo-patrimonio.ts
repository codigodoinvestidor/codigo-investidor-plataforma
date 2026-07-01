import type { AtivoComValor } from "@/lib/tipos-patrimonio";

export type AtivoApi = {
  id: string;
  tipo: string;
  ticker: string | null;
  nome: string;
  quantidade: string;
  valorCompraUnitario: string;
  dataCompra: string;
  percentualIdeal: string | null;
};

export type CotacoesApi = Record<string, { preco: number; variacaoDia: number | null }>;

// Calcula valor atual/rentabilidade de cada ativo a partir das cotações em
// tempo real — usado em Patrimônio e em Metas (pra "conciliar" os números).
export function calcularAtivosComValor(ativos: AtivoApi[], cotacoes: CotacoesApi): AtivoComValor[] {
  return ativos.map((a) => {
    const quantidade = Number(a.quantidade);
    const valorCompraUnitario = Number(a.valorCompraUnitario);
    const valorCompra = quantidade * valorCompraUnitario;
    const cotacao = a.ticker ? cotacoes[a.ticker] : undefined;
    const temCotacao = cotacao !== undefined;
    const precoAtual = cotacao?.preco ?? valorCompraUnitario;
    const valorAtual = quantidade * precoAtual;
    const ganho = valorAtual - valorCompra;
    const rentabilidadePct = valorCompra > 0 ? (ganho / valorCompra) * 100 : 0;

    return {
      id: a.id,
      tipo: a.tipo as AtivoComValor["tipo"],
      ticker: a.ticker,
      nome: a.nome,
      quantidade: a.quantidade,
      valorCompraUnitario: a.valorCompraUnitario,
      dataCompra: a.dataCompra,
      percentualIdeal: a.percentualIdeal ? Number(a.percentualIdeal) : null,
      precoAtual,
      valorAtual,
      valorCompra,
      ganho,
      rentabilidadePct,
      temCotacao,
      variacaoDia: cotacao?.variacaoDia ?? null,
    };
  });
}

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
