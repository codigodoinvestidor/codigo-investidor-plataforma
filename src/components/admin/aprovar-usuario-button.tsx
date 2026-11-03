"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function AprovarUsuarioButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function aprovar() {
    setCarregando(true);
    try {
      await fetch("/api/admin/aprovar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <button
      onClick={aprovar}
      disabled={carregando}
      className="flex items-center gap-1.5 rounded-full bg-dourado px-3 py-1.5 text-xs font-medium text-navy transition hover:bg-dourado-claro disabled:opacity-50"
    >
      <Check size={13} />
      {carregando ? "Aprovando..." : "Aprovar"}
    </button>
  );
}
