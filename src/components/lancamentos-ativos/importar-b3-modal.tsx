"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type Props = { onSuccess?: () => void };

async function xlsxParaCsv(file: File): Promise<string> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
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
      let csv: string;
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        csv = await xlsxParaCsv(file);
      } else {
        csv = await file.text();
      }
      const res = await fetch("/api/lancamentos-ativos/importar-b3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro ao importar."); return; }
      setResultado(`${data.importados} operação(ões) importada(s) com sucesso.`);
      onSuccess?.();
    } catch {
      setErro("Erro ao ler o arquivo. Tente novamente.");
    } finally {
      setImportando(false);
    }
  }

  function onArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processar(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processar(file);
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
      <div className="w-full max-w-md rounded-2xl border border-borda bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">Importar da B3</h2>
          <button onClick={() => { setAberto(false); setResultado(null); setErro(null); }} className="text-foreground/40 hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-foreground/5 p-3 text-xs text-foreground/60 space-y-1">
          <p className="font-medium text-foreground/80">Como exportar da B3:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Acesse <span className="text-dourado">investidor.b3.com.br</span></li>
            <li>Extratos e Informativos → Negociações</li>
            <li>Selecione o período e clique em "Exportar"</li>
            <li>Faça o upload do arquivo CSV abaixo</li>
          </ol>
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
