import { unstable_cache } from "next/cache";

const BACEN_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export const SERIE_CDI = 12;
export const SERIE_IPCA = 433;

type PontoBacen = { data: string; valor: string };

function parseDataBr(data: string): Date {
  const [dia, mes, ano] = data.split("/").map(Number);
  return new Date(ano, mes - 1, dia);
}

async function _buscarSerieBacen(codigo: number, ultimosN: number) {
  try {
    const resposta = await fetch(
      `${BACEN_BASE_URL}.${codigo}/dados/ultimos/${ultimosN}?formato=json`,
      { next: { revalidate: 86400 } }
    );
    if (!resposta.ok) return [];
    const dados: PontoBacen[] = await resposta.json();
    // retorna data como string ISO para ser serializável pelo unstable_cache
    return dados.map((p) => ({ data: parseDataBr(p.data).toISOString(), valorPct: Number(p.valor) }));
  } catch {
    return [];
  }
}

// Cache por 24h — Bacen não atualiza com mais frequência que isso
export const buscarSerieBacen = (codigo: number, ultimosN: number) =>
  unstable_cache(
    () => _buscarSerieBacen(codigo, ultimosN),
    [`bacen-${codigo}-${ultimosN}`],
    { revalidate: 86400, tags: [`bacen-${codigo}`] }
  )();

export function acumularRetorno(pontos: { valorPct: number }[]) {
  return pontos.reduce((acumulado, p) => acumulado * (1 + p.valorPct / 100), 1);
}
