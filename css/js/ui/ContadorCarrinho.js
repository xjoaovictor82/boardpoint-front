import { obterElemento } from "../utilitarios/dom.js";
/** Número de itens no ícone do carrinho (some quando o carrinho está vazio). */
export class ContadorCarrinho {
    #elemento = obterElemento("carrinhoContador");
    #servico;
    constructor(servico) {
        this.#servico = servico;
        servico.aoMudar(() => this.atualizar());
        this.atualizar();
    }
    atualizar() {
        const total = this.#servico.carrinho.totalUnidades;
        this.#elemento.textContent = String(total);
        this.#elemento.style.display = total > 0 ? "flex" : "none";
    }
}
