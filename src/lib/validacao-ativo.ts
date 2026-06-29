import { z } from "zod";

export const ativoSchema = z
  .object({
    tipo: z.enum(["ACAO", "FII", "ETF", "RENDA_FIXA", "IMOVEL", "VEICULO", "OUTRO"]),
    ticker: z.string().trim().toUpperCase().nullable().optional(),
    nome: z.string().min(1, "Nome é obrigatório"),
    quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero"),
    valorCompraUnitario: z.coerce.number().positive("Valor deve ser maior que zero"),
    dataCompra: z.coerce.date(),
    percentualIdeal: z.coerce.number().min(0).max(100).nullable().optional(),
  })
  .refine(
    (dados) => {
      const exigeTicker = ["ACAO", "FII", "ETF"].includes(dados.tipo);
      return !exigeTicker || (dados.ticker != null && dados.ticker.length > 0);
    },
    { message: "Ticker é obrigatório para ações, FIIs e ETFs", path: ["ticker"] }
  );

export type AtivoInput = z.infer<typeof ativoSchema>;
