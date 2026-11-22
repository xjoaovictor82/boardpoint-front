const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Valor em reais; devolve null quando não há preço ("Consulte o valor"). */
export function formatarPreco(preco: number | null | undefined): string | null {
  if (preco === null || preco === undefined) return null;
  return MOEDA.format(preco);
}

export function formatarMoeda(valor: number): string {
  return MOEDA.format(valor);
}

/** As imagens vêm do banco como "produtos/xxx/1.jpg". Com "/" na frente funcionam em qualquer rota. */
export function urlImagem(caminho: string): string {
  return caminho.startsWith("/") || caminho.startsWith("http") ? caminho : `/${caminho}`;
}