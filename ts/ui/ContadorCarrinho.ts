import type { ServicoCarrinho } from "../servicos/ServicoCarrinho.js";
import { obterElemento } from "../utilitarios/dom.js";

/** Número de itens no ícone do carrinho (some quando o carrinho está vazio). */
export class ContadorCarrinho {
  readonly #elemento = obterElemento("carrinhoContador");
  readonly #servico: ServicoCarrinho;

  constructor(servico: ServicoCarrinho) {
    this.#servico = servico;
    servico.aoMudar(() => this.atualizar());
    this.atualizar();
  }

  atualizar(): void {
    const total = this.#servico.carrinho.totalUnidades;
    this.#elemento.textContent = String(total);
    this.#elemento.style.display = total > 0 ? "flex" : "none";
  }
}
