import { unstable_cache } from "next/cache";

const BACEN_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export const SERIE_CDI = 12;
export const SERIE_IPCA = 433;

type PontoBacen = { data: string; valor: string };

function parseDataBr(data: string): string {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function fmtDataBacen(d: Date): string {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

async function _buscarSerieBacen(codigo: number, mesesAtras: number) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, hoje.getDate());
    const url = `${BACEN_BASE_URL}.${codigo}/dados?dataInicial=${fmtDataBacen(inicio)}&dataFinal=${fmtDataBacen(hoje)}&formato=json`;
    const resposta = await fetch(url, { cache: "no-store" });
    if (!resposta.ok) return [];
    const dados: PontoBacen[] = await resposta.json();
    return dados.map((p) => ({ data: parseDataBr(p.data), valorPct: Number(p.valor) }));
  } catch {
    return [];
  }
}

// CDI: busca 62 meses para cobrir qualquer filtro até 5 anos, cache 24h
const _cacheCdi = unstable_cache(
  () => _buscarSerieBacen(SERIE_CDI, 62),
  ["bacen-cdi-v2"],
  { revalidate: 86400, tags: ["bacen-cdi"] }
);

// IPCA: busca 62 meses, cache 24h
const _cacheIpca = unstable_cache(
  () => _buscarSerieBacen(SERIE_IPCA, 62),
  ["bacen-ipca-v2"],
  { revalidate: 86400, tags: ["bacen-ipca"] }
);

export const buscarCdi = () => _cacheCdi();
export const buscarIpca = () => _cacheIpca();

export async function buscarSerieBacen(codigo: number, _ultimosN: number) {
  if (codigo === SERIE_CDI) return buscarCdi();
  if (codigo === SERIE_IPCA) return buscarIpca();
  return _buscarSerieBacen(codigo, 62);
}

export function acumularRetorno(pontos: { valorPct: number }[]) {
  return pontos.reduce((acumulado, p) => acumulado * (1 + p.valorPct / 100), 1);
}
