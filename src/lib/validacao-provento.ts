import { z } from "zod";

export const TIPOS_PAGAMENTO_PROVENTO = ["Dividendos", "JSCP", "Rendimentos", "Outro"] as const;

export const proventoSchema = z.object({
  ticker: z.string().trim().toUpperCase().min(1, "Ticker é obrigatório"),
  tipoPagamento: z.enum(TIPOS_PAGAMENTO_PROVENTO),
  valorTotal: z.coerce.number().positive("Valor deve ser maior que zero"),
  dataCom: z.coerce.date().nullable().optional(),
  dataPagamento: z.coerce.date(),
});

export type ProventoInput = z.infer<typeof proventoSchema>;
