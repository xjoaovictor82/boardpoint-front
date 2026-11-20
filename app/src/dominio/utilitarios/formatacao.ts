import type { Preco } from "../tipos/Tipos";

const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Valor em reais; devolve null quando não há preço ("Consulte o valor"). */
export function formatarPreco(preco: Preco | undefined): string | null {
  if (preco === null || preco === undefined) return null;
  return MOEDA.format(preco);
}

export function formatarMoeda(valor: number): string {
  return MOEDA.format(valor);
}

/** "2026-03-10 14:05:00" -> "10/03/2026 14:05" (devolve o texto original se não for uma data válida). */
export function formatarData(iso: string): string {
  const data = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(data.getTime())) return iso;
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data.toLocaleDateString("pt-BR")} ${hora}`;
}
