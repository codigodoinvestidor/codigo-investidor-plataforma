"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type Props = { onSuccess?: () => void };

type LancamentoImport = {
  tipo: "COMPRA" | "VENDA";
  ticker: string;
  nome: string | null;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  dataOperacao: string;
  corretora: string | null;
};

// Detecta se é o relatório consolidado de posição (tem aba "Posição - Ações")
function ehRelatorioConsolidado(sheetNames: string[]): boolean {
  return sheetNames.some((n) => n.toLowerCase().includes("posição") || n.toLowerCase().includes("posicao"));
}

// Lê posições do relatório consolidado e converte em lançamentos de COMPRA
async function lerPosicaoComoLancamentos(buf: ArrayBuffer, XLSX: typeof import("xlsx")): Promise<LancamentoImport[]> {
  const wb = XLSX.read(buf, { type: "array" });
  const hoje = new Date().toISOString().slice(0, 10);
  const lancamentos: LancamentoImport[] = [];

  const abas = [
    { nome: "Posição - Ações", corretora: null },
    { nome: "Posição - ETF", corretora: null },
    { nome: "Posição - Fundos", corretora: null },
  ];

  for (const { nome: abaNome } of abas) {
    const ws = wb.Sheets[abaNome];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: "" });
    for (const row of rows.slice(1)) {
      const ticker = String(row[3] ?? "").trim().toUpperCase();
      if (!ticker || ticker.length < 4) continue;
      const quantidade = Number(row[8]);
      if (!quantidade || quantidade <= 0) continue;
      const preco = Number(row[12]);
      if (!preco || preco <= 0) continue;
      const produtoRaw = String(row[0] ?? "").trim();
      const nomeParts = produtoRaw.split(" - ");
      const nome = nomeParts.length > 1 ? nomeParts.slice(1).join(" - ").trim() : produtoRaw;
      const instituicao = String(row[1] ?? "").trim() || null;
      lancamentos.push({
        tipo: "COMPRA",
        ticker,
        nome,
        quantidade,
        precoUnitario: preco,
        valorTotal: quantidade * preco,
        dataOperacao: hoje,
        corretora: instituicao,
      });
    }
  }
  return lancamentos;
}

// Lê arquivo de negociações (CSV ou XLSX com formato de negociações)
async function lerNegociacoes(buf: ArrayBuffer, XLSX: typeof import("xlsx")): Promise<string> {
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_csv(ws, { FS: ";" });
}

export function ImportarB3Modal({ onSuccess }: Props) {
  const [aberto, setAberto] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processar(file: File) {
    setErro(null);
    setResultado(null);
    setImportando(true);
    try {
      const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

      if (isXlsx) {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });

        if (ehRelatorioConsolidado(wb.SheetNames)) {
          // Relatório de posição → converte para lançamentos de COMPRA
          const lancamentos = await lerPosicaoComoLancamentos(buf, XLSX);
          if (lancamentos.length === 0) {
            setErro("Nenhum ativo encontrado no arquivo.");
            return;
          }
          // Envia em bulk para a API
          const res = await fetch("/api/lancamentos-ativos/importar-posicao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lancamentos }),
          });
          const data = await res.json();
          if (!res.ok) { setErro(data.erro ?? "Erro ao importar."); return; }
          setResultado(`${data.importados} posição(ões) importada(s) como Compra.`);
          onSuccess?.();
          return;
        }

        // Arquivo de negociações em XLSX → converte para CSV e usa parser existente
        const csv = await lerNegociacoes(buf, XLSX);
        await enviarCsv(csv);
      } else {
        // CSV direto
        const csv = await file.text();
        await enviarCsv(csv);
      }
    } catch {
      setErro("Erro ao ler o arquivo. Tente novamente.");
    } finally {
      setImportando(false);
    }
  }

  async function enviarCsv(csv: string) {
    const res = await fetch("/api/lancamentos-ativos/importar-b3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();
    if (!res.ok) { setErro(data.erro ?? "Erro ao importar."); return; }
    setResultado(`${data.importados} operação(ões) importada(s) com sucesso.`);
    onSuccess?.();
  }

  function onArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processar(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processar(file);
  }

  function fechar() { setAberto(false); setResultado(null); setErro(null); }

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
      <div className="w-full max-w-md rounded-2xl border border-borda bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">Importar da B3</h2>
          <button onClick={fechar} className="text-foreground/40 hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="mb-4 rounded-lg bg-foreground/5 p-3 text-xs text-foreground/60 space-y-1">
          <p className="font-medium text-foreground/80">Arquivos aceitos:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><span className="text-foreground/80">Relatório Consolidado</span> — posições viram lançamentos de Compra</li>
            <li><span className="text-foreground/80">Extrato de Negociações</span> — importa compras e vendas com data</li>
          </ul>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-borda py-10 transition hover:border-dourado hover:bg-dourado/5"
        >
          <Upload size={28} className="text-foreground/30" />
          <p className="text-sm text-foreground/50">Arraste o arquivo ou clique para selecionar</p>
          <p className="text-xs text-foreground/30">.XLSX ou .CSV exportado da B3</p>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={onArquivo} />
        </div>

        {importando && <p className="mt-3 text-center text-sm text-foreground/50">Importando...</p>}
        {erro && <p className="mt-3 text-center text-sm text-red-400">{erro}</p>}
        {resultado && (
          <div className="mt-3 rounded-lg bg-green-500/10 p-3 text-center text-sm text-green-400">
            {resultado}
          </div>
        )}
      </div>
    </div>
  );
}
