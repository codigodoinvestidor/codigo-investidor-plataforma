export const TIPOS_ATIVO = [
  { valor: "ACAO", rotulo: "Ação", exigeTicker: true },
  { valor: "FII", rotulo: "FII", exigeTicker: true },
  { valor: "ETF", rotulo: "ETF", exigeTicker: true },
  { valor: "RENDA_FIXA", rotulo: "Renda fixa", exigeTicker: false },
  { valor: "IMOVEL", rotulo: "Imóvel", exigeTicker: false },
  { valor: "VEICULO", rotulo: "Veículo", exigeTicker: false },
  { valor: "OUTRO", rotulo: "Outro", exigeTicker: false },
] as const;

export type TipoAtivo = (typeof TIPOS_ATIVO)[number]["valor"];

export function rotuloTipoAtivo(tipo: string) {
  return TIPOS_ATIVO.find((t) => t.valor === tipo)?.rotulo ?? tipo;
}

export function tipoExigeTicker(tipo: string) {
  return TIPOS_ATIVO.find((t) => t.valor === tipo)?.exigeTicker ?? false;
}
