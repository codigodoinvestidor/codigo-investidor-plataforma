"use client";

type ItemPayload = { name: string; value: number; color: string };

type Props = {
  active?: boolean;
  payload?: ItemPayload[];
  label?: string;
  formatter?: (value: number, name: string) => string;
};

export function TooltipEscuro({ active, payload, label, formatter }: Props) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--superficie)",
        border: "1px solid var(--borda)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        minWidth: 140,
      }}
    >
      {label && (
        <p style={{ color: "var(--foreground)", opacity: 0.55, fontSize: 11, marginBottom: 6 }}>
          {label}
        </p>
      )}
      {payload.map((item, i) => (
        <p key={i} style={{ fontSize: 13, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          <span style={{ color: "var(--foreground)", opacity: 0.6 }}>{item.name}: </span>
          <span style={{ color: item.color, fontWeight: 600 }}>
            {formatter ? formatter(item.value, item.name) : String(item.value)}
          </span>
        </p>
      ))}
    </div>
  );
}
