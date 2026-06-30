import { unstable_cache } from "next/cache";

const BACEN_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export const SERIE_CDI = 12;
export const SERIE_IPCA = 433;

type PontoBacen = { data: string; valor: string };

function parseDataBr(data: string): string {
  // "dd/mm/yyyy" → "yyyy-mm-dd"
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

async function _buscarSerieBacen(codigo: number) {
  // Busca sempre 1500 registros (cobre ~5 anos de CDI diário ou ~60 meses de IPCA)
  // Todos os períodos usam o mesmo cache entry
  try {
    const resposta = await fetch(
      `${BACEN_BASE_URL}.${codigo}/dados/ultimos/1500?formato=json`,
      { cache: "no-store" } // unstable_cache cuida do cache
    );
    if (!resposta.ok) return [];
    const dados: PontoBacen[] = await resposta.json();
    return dados.map((p) => ({ data: parseDataBr(p.data), valorPct: Number(p.valor) }));
  } catch {
    return [];
  }
}

// Cache único por série, revalidado a cada 24h
const _cacheCdi = unstable_cache(
  () => _buscarSerieBacen(SERIE_CDI),
  ["bacen-cdi"],
  { revalidate: 86400, tags: ["bacen-cdi"] }
);

const _cacheIpca = unstable_cache(
  () => _buscarSerieBacen(SERIE_IPCA),
  ["bacen-ipca"],
  { revalidate: 86400, tags: ["bacen-ipca"] }
);

export const buscarCdi = () => _cacheCdi();
export const buscarIpca = () => _cacheIpca();

// Mantido por compatibilidade
export async function buscarSerieBacen(codigo: number, _ultimosN: number) {
  if (codigo === SERIE_CDI) return buscarCdi();
  if (codigo === SERIE_IPCA) return buscarIpca();
  return _buscarSerieBacen(codigo);
}

export function acumularRetorno(pontos: { valorPct: number }[]) {
  return pontos.reduce((acumulado, p) => acumulado * (1 + p.valorPct / 100), 1);
}
