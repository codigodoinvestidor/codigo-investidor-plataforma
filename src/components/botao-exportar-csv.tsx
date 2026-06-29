import { Download } from "lucide-react";

export function BotaoExportarCsv({ href }: { href: string }) {
  return (
    <a
      href={href}
      download
      className="flex items-center gap-1.5 rounded-full border border-borda px-3 py-1.5 text-xs font-medium text-foreground/70 transition hover:border-dourado/40 hover:text-dourado"
    >
      <Download size={13} />
      Exportar CSV
    </a>
  );
}
