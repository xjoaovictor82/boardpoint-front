import { validarEmail } from "../utilitarios/validacoesConta";
import type { ItemEntradaPedido } from "./tipos";

/** Regras dos dados do cliente (iguais às de pedidos.php). */
export function erroCliente(nome: string, telefone: string, email: string): string | null {
  if (nome === "" || telefone === "") return "Nome e telefone do cliente são obrigatórios.";
  if (nome.length > 150 || telefone.length > 30) return "Nome ou telefone muito longos.";
  if (email !== "" && !validarEmail(email)) return "E-mail inválido. Exemplo: nome@exemplo.com";
  return null;
}

/** Regras dos itens de um pedido NOVO (edição não manda itens: a API não os altera). */
export function erroItensNovoPedido(
  itens: ItemEntradaPedido[],
  produtos: { readonly id: number; readonly nome: string; readonly estoque: number }[],
): string | null {
  if (itens.length === 0) return "Adicione pelo menos um item ao pedido.";
  if (itens.some((item) => !Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 1000)) {
    return "Informe quantidades inteiras entre 1 e 1000.";
  }

  // Confere o estoque somando linhas do mesmo produto.
  const somas = new Map<number, number>();
  for (const item of itens) somas.set(item.produto_id, (somas.get(item.produto_id) ?? 0) + item.quantidade);
  for (const [produtoId, soma] of somas) {
    const produto = produtos.find((p) => p.id === produtoId);
    if (produto !== undefined && soma > produto.estoque) {
      return `Estoque insuficiente para "${produto.nome}" (disponível: ${produto.estoque}).`;
    }
  }
  return null;
}
