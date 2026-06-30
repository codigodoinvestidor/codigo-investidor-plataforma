// Suporta dois formatos de exportação da B3:
//
// Formato 1 — Negociações (Área do Investidor > Extratos > Negociações):
//   Entrada/Saída;Data do Negócio;Código de Negociação;Tipo de Mercado;Instituição;Quantidade;Preço;Valor
//   C;01/02/2024;PETR4;Mercado a Vista;XP Investimentos;100;32,50;3.250,00
//
// Formato 2 — Movimentações (Área do Investidor > Extratos > Movimentações):
//   Produto;Conta;Data;Tipo de Movimentação;Instituição;Quantidade;Preço unitário;Valor da Operação
//   Ações - PETR4;12345;01/02/2024;Compra;XP INVESTIMENTOS;100;32,50;3.250,00

type LancamentoB3 = {
  tipo: "COMPRA" | "VENDA";
  ticker: string;
  nome: string | null;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  dataOperacao: Date;
  corretora: string | null;
};

function parsearNumero(valor: string): number {
  // "3.250,50" → 3250.50
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

function parsearData(valor: string): Date {
  // "01/02/2024" → 2024-02-01
  const [dia, mes, ano] = valor.trim().split("/");
  return new Date(`${ano}-${mes}-${dia}T12:00:00Z`);
}

function extrairTicker(texto: string): string {
  // "Ações - PETR4" ou "FII - MXRF11" → "PETR4"
  const match = texto.match(/[-–]\s*([A-Z0-9]{4,6})\s*$/);
  if (match) return match[1];
  // Tenta pegar palavra maiúscula de 4-6 chars
  const words = texto.trim().split(/\s+/);
  for (const w of words.reverse()) {
    if (/^[A-Z]{3,5}\d{1,2}$/.test(w)) return w;
  }
  return texto.trim().substring(0, 10).toUpperCase();
}

export function parsearCsvB3(csv: string): LancamentoB3[] {
  const linhas = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (linhas.length < 2) return [];

  // detecta separador: ; ou ,
  const sep = linhas[0].includes(";") ? ";" : ",";
  const cabecalho = linhas[0].split(sep).map((c) => c.trim().toLowerCase());
  const resultado: LancamentoB3[] = [];

  // Formato 1: "entrada/saída" no cabeçalho
  if (cabecalho.some((c) => c.includes("entrada"))) {
    for (const linha of linhas.slice(1)) {
      const cols = linha.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 8) continue;
      const [entradaSaida, dataStr, ticker, , instituicao, qtdStr, precoStr, valorStr] = cols;
      const tipo = entradaSaida.toUpperCase().startsWith("C") ? "COMPRA" : "VENDA";
      const quantidade = parsearNumero(qtdStr);
      const precoUnitario = parsearNumero(precoStr);
      const valorTotal = parsearNumero(valorStr) || quantidade * precoUnitario;
      if (!ticker || quantidade <= 0) continue;
      resultado.push({
        tipo,
        ticker: ticker.trim().toUpperCase(),
        nome: null,
        quantidade,
        precoUnitario,
        valorTotal,
        dataOperacao: parsearData(dataStr),
        corretora: instituicao?.trim() || null,
      });
    }
    return resultado;
  }

  // Formato 2: "produto" e "tipo de movimentação" no cabeçalho
  if (cabecalho.some((c) => c.includes("produto"))) {
    const iProduto = cabecalho.findIndex((c) => c.includes("produto"));
    const iData = cabecalho.findIndex((c) => c === "data" || c.includes("data"));
    const iTipo = cabecalho.findIndex((c) => c.includes("tipo"));
    const iInstituicao = cabecalho.findIndex((c) => c.includes("institui"));
    const iQtd = cabecalho.findIndex((c) => c.includes("quantidade"));
    const iPreco = cabecalho.findIndex((c) => c.includes("pre"));
    const iValor = cabecalho.findIndex((c) => c.includes("valor"));

    for (const linha of linhas.slice(1)) {
      const cols = linha.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
      const tipoMov = cols[iTipo]?.toLowerCase() ?? "";
      if (!tipoMov.includes("compra") && !tipoMov.includes("venda")) continue;
      const tipo = tipoMov.includes("compra") ? "COMPRA" : "VENDA";
      const produto = cols[iProduto] ?? "";
      const ticker = extrairTicker(produto);
      const quantidade = parsearNumero(cols[iQtd]);
      const precoUnitario = parsearNumero(cols[iPreco]);
      const valorTotal = parsearNumero(cols[iValor]) || quantidade * precoUnitario;
      if (!ticker || quantidade <= 0) continue;
      resultado.push({
        tipo,
        ticker,
        nome: null,
        quantidade,
        precoUnitario,
        valorTotal,
        dataOperacao: parsearData(cols[iData]),
        corretora: cols[iInstituicao]?.trim() || null,
      });
    }
    return resultado;
  }

  return resultado;
}
