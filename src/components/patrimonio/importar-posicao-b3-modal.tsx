"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type Props = { onSuccess?: () => void };

type AtivoImport = {
  tipo: "ACAO" | "FII" | "ETF";
  ticker: string;
  nome: string;
  quantidade: number;
  valorCompraUnitario: number;
  dataCompra: string;
};

async function lerPosicaoXlsx(file: File): Promise<AtivoImport[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const hoje = new Date().toISOString().slice(0, 10);
  const ativos: AtivoImport[] = [];

  const abas: Array<{ nome: string; tipo: "ACAO" | "FII" | "ETF" }> = [
    { nome: "Posição - Ações", tipo: "ACAO" },
    { nome: "Posição - ETF", tipo: "ETF" },
    { nome: "Posição - Fundos", tipo: "FII" },
  ];

  for (const { nome: abaNome, tipo } of abas) {
    const ws = wb.Sheets[abaNome];
    if (!ws) continue;

    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: "" });

    // linha 0 é o cabeçalho, linhas seguintes são dados
    // Col 3 = "Código de Negociação" (ticker limpo)
    // Col 0 = "Produto" (nome completo)
    // Col 8 = "Quantidade"
    // Col 12 = "Preço de Fechamento"
    for (const row of rows.slice(1)) {
      const ticker = String(row[3] ?? "").trim().toUpperCase();
      if (!ticker || ticker.length < 4) continue;

      const quantidade = Number(row[8]);
      if (!quantidade || quantidade <= 0) continue;

      const preco = Number(row[12]);
      if (!preco || preco <= 0) continue;

      // extrai nome limpo do produto: "BBSE3 - BB SEGURIDADE..." → "BB SEGURIDADE..."
      const produtoRaw = String(row[0] ?? "").trim();
      const nomeParts = produtoRaw.split(" - ");
      const nome = nomeParts.length > 1 ? nomeParts.slice(1).join(" - ").trim() : produtoRaw;

      ativos.push({ tipo, ticker, nome, quantidade, valorCompraUnitario: preco, dataCompra: hoje });
    }
  }

  return ativos;
}

export function ImportarPosicaoB3Modal({ onSuccess }: Props) {
  const [aberto, setAberto] = useState(false);
  const [preview, setPreview] = useState<AtivoImport[] | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function fechar() {
    setAberto(false);
    setPreview(null);
    setResultado(null);
    setErro(null);
  }

  async function onArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setResultado(null);
    try {
      const ativos = await lerPosicaoXlsx(file);
      if (ativos.length === 0) { setErro("Nenhum ativo encontrado. Verifique se é o arquivo correto da B3."); return; }
      setPreview(ativos);
    } catch {
      setErro("Erro ao ler o arquivo XLSX.");
    }
  }

  async function confirmar() {
    if (!preview) return;
    setImportando(true);
    setErro(null);
    const res = await fetch("/api/ativos/importar-posicao-b3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativos: preview }),
    });
    const data = await res.json();
    setImportando(false);
    if (!res.ok) { setErro(data.erro ?? "Erro ao importar."); return; }
    setResultado(
      data.importados > 0
        ? `${data.importados} ativo(s) importado(s)${data.ignorados > 0 ? `, ${data.ignorados} já existiam` : ""}.`
        : data.mensagem ?? "Todos os tickers já estavam cadastrados."
    );
    setPreview(null);
    onSuccess?.();
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="flex items-center gap-2 rounded-lg border border-borda px-3 py-2 text-sm text-foreground/60 transition hover:border-dourado hover:text-dourado">
        <Upload size={15} />
        Importar da B3
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-borda bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">Importar posição da B3</h2>
          <button onClick={fechar} className="text-foreground/40 hover:text-foreground"><X size={20} /></button>
        </div>

        {!preview && !resultado && (
          <>
            <div className="mb-4 rounded-lg bg-foreground/5 p-3 text-xs text-foreground/60 space-y-1">
              <p className="font-medium text-foreground/80">Como exportar da B3:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Acesse <span className="text-dourado">investidor.b3.com.br</span></li>
                <li>Extratos e Informativos → Posição</li>
                <li>Selecione "Relatório Consolidado" e o período</li>
                <li>Clique em "Exportar" → baixe o <strong>.xlsx</strong></li>
              </ol>
            </div>

            <div
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-borda py-10 transition hover:border-dourado hover:bg-dourado/5"
            >
              <Upload size={28} className="text-foreground/30" />
              <p className="text-sm text-foreground/50">Clique para selecionar o arquivo</p>
              <p className="text-xs text-foreground/30">relatorio-consolidado-anual-*.xlsx</p>
              <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onArquivo} />
            </div>
          </>
        )}

        {preview && (
          <div className="space-y-3">
            <p className="text-sm text-foreground/60">{preview.length} ativo(s) encontrado(s). Revise antes de importar:</p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-borda">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-borda text-foreground/40">
                    <th className="p-2 text-left">Ticker</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">Preço atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borda">
                  {preview.map((a) => (
                    <tr key={a.ticker}>
                      <td className="p-2 font-mono font-semibold text-foreground">{a.ticker}</td>
                      <td className="p-2 text-foreground/60">{a.tipo}</td>
                      <td className="p-2 text-right text-foreground/70">{a.quantidade.toLocaleString("pt-BR")}</td>
                      <td className="p-2 text-right text-foreground/70">{a.valorCompraUnitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-foreground/40">O preço atual será usado como valor de compra. Você pode editar depois.</p>
            {erro && <p className="text-xs text-red-400">{erro}</p>}
            <div className="flex gap-2">
              <button onClick={() => setPreview(null)} className="flex-1 rounded-lg border border-borda py-2 text-sm text-foreground/60 hover:bg-foreground/5">Voltar</button>
              <button onClick={confirmar} disabled={importando} className="btn-primary flex-1">{importando ? "Importando..." : "Confirmar importação"}</button>
            </div>
          </div>
        )}

        {resultado && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 p-4 text-center text-sm text-green-400">{resultado}</div>
            <button onClick={fechar} className="btn-primary w-full">Fechar</button>
          </div>
        )}

        {erro && !preview && (
          <p className="mt-3 text-center text-sm text-red-400">{erro}</p>
        )}
      </div>
    </div>
  );
}
