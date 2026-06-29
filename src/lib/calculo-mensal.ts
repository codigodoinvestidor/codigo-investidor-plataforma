import { CATEGORIAS_DESPESA } from "@/lib/categorias";

export type LancamentoCalculo = {
  tipo: "RENDA" | "DESPESA";
  categoria: string;
  valor: number;
  mesInicio: number;
  anoInicio: number;
  mesFim: number | null;
  anoFim: number | null;
};

export function lancamentoAplicaEm(l: LancamentoCalculo, mes: number, ano: number) {
  const apósInicio = ano > l.anoInicio || (ano === l.anoInicio && mes >= l.mesInicio);
  if (!apósInicio) return false;

  if (l.mesFim == null || l.anoFim == null) return true;

  return ano < l.anoFim || (ano === l.anoFim && mes <= l.mesFim);
}

export type ResumoMes = {
  mes: number;
  renda: number;
  despesa: number;
  saldo: number;
  porCategoria: Record<string, number>;
};

export function gerarResumoAnual(lancamentos: LancamentoCalculo[], ano: number) {
  const meses: ResumoMes[] = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    renda: 0,
    despesa: 0,
    saldo: 0,
    porCategoria: Object.fromEntries(CATEGORIAS_DESPESA.map((c) => [c, 0])),
  }));

  for (const l of lancamentos) {
    for (const resumoMes of meses) {
      if (!lancamentoAplicaEm(l, resumoMes.mes, ano)) continue;

      if (l.tipo === "RENDA") {
        resumoMes.renda += l.valor;
      } else {
        resumoMes.despesa += l.valor;
        resumoMes.porCategoria[l.categoria] = (resumoMes.porCategoria[l.categoria] ?? 0) + l.valor;
      }
    }
  }

  for (const m of meses) {
    m.saldo = m.renda - m.despesa;
  }

  const totalAno = {
    renda: meses.reduce((s, m) => s + m.renda, 0),
    despesa: meses.reduce((s, m) => s + m.despesa, 0),
    saldo: meses.reduce((s, m) => s + m.saldo, 0),
    porCategoria: Object.fromEntries(
      CATEGORIAS_DESPESA.map((c) => [c, meses.reduce((s, m) => s + m.porCategoria[c], 0)])
    ),
  };

  return { meses, totalAno };
}
