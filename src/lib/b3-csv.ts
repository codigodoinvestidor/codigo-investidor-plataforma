// Parser flexível para exportações da B3 (XLSX convertido para CSV ou CSV direto).
// A B3 coloca linhas de metadados antes do cabeçalho real — o parser escaneia
// todas as linhas até encontrar a linha de cabeçalho correta.

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

function parsearNumero(valor: string | undefined): number {
  if (!valor) return 0;
  const v = valor.trim().replace(/^R\$\s*/, "");
  // "3.250,50" (pt-BR) ou "3,250.50" (en-US) ou "3250.50"
  if (v.includes(",") && v.includes(".")) {
    // decide qual é o separador decimal pelo último separador
    return v.lastIndexOf(",") > v.lastIndexOf(".")
      ? parseFloat(v.replace(/\./g, "").replace(",", "."))
      : parseFloat(v.replace(/,/g, ""));
  }
  if (v.includes(",")) return parseFloat(v.replace(",", "."));
  return parseFloat(v) || 0;
}

function parsearData(valor: string | undefined): Date {
  if (!valor) return new Date();
  const v = valor.trim();
  if (v.includes("/")) {
    const parts = v.split("/");
    // dd/mm/yyyy
    if (parts[2]?.length === 4) {
      const [dia, mes, ano] = parts;
      return new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T12:00:00Z`);
    }
    // mm/dd/yyyy (xlsx pode gerar assim)
    if (parts[2]?.length === 4) {
      const [mes, dia, ano] = parts;
      return new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T12:00:00Z`);
    }
  }
  if (v.includes("-")) {
    return new Date(v.includes("T") ? v : `${v}T12:00:00Z`);
  }
  return new Date();
}

function extrairTicker(texto: string): string {
  const t = texto.trim().toUpperCase();
  // "Ações - PETR4" / "FII - MXRF11" / "PETR4 - ..."
  const match = t.match(/[-–]\s*([A-Z]{3,5}\d{1,2}[A-Z]?)\s*($|[-–])/);
  if (match) return match[1];
  const match2 = t.match(/([A-Z]{3,5}\d{1,2}[A-Z]?)/);
  if (match2) return match2[1];
  return t.substring(0, 10);
}

function splitLinha(linha: string, sep: string): string[] {
  return linha.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
}

// Encontra a linha de cabeçalho escaneando as primeiras 20 linhas
function encontrarCabecalho(
  linhas: string[],
  sep: string
): { idx: number; cols: string[] } | null {
  for (let i = 0; i < Math.min(linhas.length, 20); i++) {
    const cols = splitLinha(linhas[i], sep).map((c) => c.toLowerCase());
    if (
      cols.some((c) => c.includes("entrada") || c.includes("saída") || c.includes("saida")) ||
      cols.some((c) => c.includes("produto") && cols.some((d) => d.includes("movimenta"))) ||
      cols.some((c) => c.includes("negocio") || c.includes("negócio")) ||
      cols.some((c) => c.includes("código de negociação") || c.includes("codigo de negociacao"))
    ) {
      return { idx: i, cols };
    }
  }
  return null;
}

export function parsearCsvB3(csv: string): LancamentoB3[] {
  const linhas = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (linhas.length < 2) return [];

  // detecta separador predominante
  const primeiras = linhas.slice(0, 5).join("\n");
  const sep = (primeiras.match(/;/g)?.length ?? 0) >= (primeiras.match(/,/g)?.length ?? 0) ? ";" : ",";

  const cab = encontrarCabecalho(linhas, sep);
  if (!cab) return [];

  const { idx: cabIdx, cols: cabecalho } = cab;
  const dadosLinhas = linhas.slice(cabIdx + 1);
  const resultado: LancamentoB3[] = [];

  // ── Formato 1: Negociações ──────────────────────────────────────────────────
  // Cabeçalho contém "entrada" ou "saída" ou "negócio"
  if (
    cabecalho.some((c) => c.includes("entrada") || c.includes("saída") || c.includes("saida")) ||
    cabecalho.some((c) => c.includes("negocio") || c.includes("negócio"))
  ) {
    const iEntrada = cabecalho.findIndex((c) => c.includes("entrada") || c.includes("saída") || c.includes("saida"));
    const iData = cabecalho.findIndex((c) => c.includes("data"));
    const iTicker = cabecalho.findIndex((c) => c.includes("código") || c.includes("codigo") || c.includes("negociação") || c.includes("negociacao") || c.includes("ticker") || c.includes("ativo"));
    const iInstituicao = cabecalho.findIndex((c) => c.includes("institui") || c.includes("corretora"));
    const iQtd = cabecalho.findIndex((c) => c.includes("quantidade") || c.includes("qtd"));
    const iPreco = cabecalho.findIndex((c) => c.includes("preço") || c.includes("preco") || c.includes("unitário") || c.includes("unitario"));
    const iValor = cabecalho.findIndex((c) => c.includes("valor") && !c.includes("unitário") && !c.includes("unitario"));

    for (const linha of dadosLinhas) {
      const cols = splitLinha(linha, sep);
      if (cols.length < 3) continue;

      const entradaSaida = (cols[iEntrada] ?? cols[0] ?? "").toUpperCase();
      const tipo: "COMPRA" | "VENDA" = entradaSaida.startsWith("C") || entradaSaida === "COMPRA" ? "COMPRA" : "VENDA";
      const ticker = (cols[iTicker] ?? cols[2] ?? "").trim().toUpperCase();
      if (!ticker || ticker.length < 4) continue;

      const quantidade = parsearNumero(cols[iQtd] ?? cols[5]);
      const precoUnitario = parsearNumero(cols[iPreco] ?? cols[6]);
      const valorTotal = parsearNumero(cols[iValor] ?? cols[7]) || quantidade * precoUnitario;
      if (quantidade <= 0) continue;

      resultado.push({
        tipo,
        ticker,
        nome: null,
        quantidade,
        precoUnitario,
        valorTotal,
        dataOperacao: parsearData(cols[iData] ?? cols[1]),
        corretora: cols[iInstituicao]?.trim() || null,
      });
    }
    return resultado;
  }

  // ── Formato 2: Movimentações ────────────────────────────────────────────────
  // Cabeçalho contém "produto" + "movimentação"
  if (cabecalho.some((c) => c.includes("produto"))) {
    const iProduto = cabecalho.findIndex((c) => c.includes("produto"));
    const iData = cabecalho.findIndex((c) => c === "data" || c.includes("data"));
    const iTipo = cabecalho.findIndex((c) => c.includes("tipo") || c.includes("movimentação") || c.includes("movimentacao"));
    const iInstituicao = cabecalho.findIndex((c) => c.includes("institui") || c.includes("corretora"));
    const iQtd = cabecalho.findIndex((c) => c.includes("quantidade") || c.includes("qtd"));
    const iPreco = cabecalho.findIndex((c) => c.includes("preço") || c.includes("preco") || c.includes("unitário") || c.includes("unitario"));
    const iValor = cabecalho.findIndex((c) => c.includes("valor") && !c.includes("unitário") && !c.includes("unitario"));

    for (const linha of dadosLinhas) {
      const cols = splitLinha(linha, sep);
      const tipoMov = (cols[iTipo] ?? "").toLowerCase();
      if (!tipoMov.includes("compra") && !tipoMov.includes("venda")) continue;
      const tipo: "COMPRA" | "VENDA" = tipoMov.includes("compra") ? "COMPRA" : "VENDA";

      const produto = cols[iProduto] ?? "";
      const ticker = extrairTicker(produto);
      if (!ticker || ticker.length < 4) continue;

      const quantidade = parsearNumero(cols[iQtd]);
      const precoUnitario = parsearNumero(cols[iPreco]);
      const valorTotal = parsearNumero(cols[iValor]) || quantidade * precoUnitario;
      if (quantidade <= 0) continue;

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
