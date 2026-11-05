import { escaparHtml, formatarMoeda } from "../utilitarios/formatacao.js";
import { obterElemento } from "../utilitarios/dom.js";
import { ModalBase } from "./ModalBase.js";
/** Janela do carrinho: lista os itens, permite remover e leva ao checkout. */
export class ModalCarrinho extends ModalBase {
    #servico;
    #itens = obterElemento("carrinhoItens");
    #rodape = obterElemento("carrinhoRodape");
    #total = obterElemento("carrinhoTotal");
    constructor(servico, aoIrParaCheckout) {
        super(obterElemento("modalCarrinho"));
        this.#servico = servico;
        obterElemento("botaoCarrinho").addEventListener("click", () => this.abrir());
        obterElemento("fundoModalCarrinho").addEventListener("click", () => this.fechar());
        obterElemento("fecharModalCarrinho").addEventListener("click", () => this.fechar());
        obterElemento("botaoIrParaCheckout").addEventListener("click", () => {
            this.fechar();
            aoIrParaCheckout();
        });
    }
    aoAbrir() {
        this.#renderizar();
    }
    #renderizar() {
        const carrinho = this.#servico.carrinho;
        if (carrinho.estaVazio) {
            this.#itens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
            this.#rodape.style.display = "none";
            return;
        }
        this.#rodape.style.display = "block";
        this.#itens.innerHTML = carrinho.itens.map((item) => `
      <div class="item-carrinho">
        <img src="${escaparHtml(item.imagem)}" alt="${escaparHtml(item.nome)}">
        <div class="item-carrinho__info">
          <p class="item-carrinho__nome">${escaparHtml(item.nome)}</p>
          <p class="item-carrinho__preco">${item.quantidade} × ${formatarMoeda(item.preco)}</p>
        </div>
        <button type="button" class="item-carrinho__remover" data-id="${item.produtoId}" aria-label="Remover">✕</button>
      </div>
    `).join("");
        this.#itens.querySelectorAll(".item-carrinho__remover").forEach((botao) => {
            botao.addEventListener("click", () => {
                this.#servico.remover(Number(botao.dataset.id));
                this.#renderizar();
            });
        });
        this.#total.textContent = formatarMoeda(carrinho.valorTotal);
    }
}
