import { obterElemento } from "../utilitarios/dom.js";
import { ModalBase } from "./ModalBase.js";
/** Janela de detalhes do produto, com escolha de quantidade e botão de compra. */
export class Lightbox extends ModalBase {
    #imagem = obterElemento("lightboxImagem");
    #tag = obterElemento("lightboxTag");
    #nome = obterElemento("lightboxNome");
    #preco = obterElemento("lightboxPreco");
    #estoque = obterElemento("lightboxEstoque");
    #compra = obterElemento("lightboxCompra");
    #menos = obterElemento("qtdMenos");
    #mais = obterElemento("qtdMais");
    #valor = obterElemento("qtdValor");
    #adicionar = obterElemento("botaoAdicionarCarrinho");
    #produto = null;
    #quantidade = 1;
    constructor(aoAdicionar) {
        super(obterElemento("lightbox"));
        obterElemento("fecharLightbox").addEventListener("click", () => this.fechar());
        this.elemento.addEventListener("click", (evento) => {
            if (evento.target === this.elemento)
                this.fechar();
        });
        this.#menos.addEventListener("click", () => this.#alterarQuantidade(-1));
        this.#mais.addEventListener("click", () => this.#alterarQuantidade(1));
        this.#adicionar.addEventListener("click", () => {
            if (!this.#produto)
                return;
            aoAdicionar(this.#produto, this.#quantidade);
        });
    }
    get fechaComEsc() {
        return true;
    }
    exibir(produto) {
        this.#produto = produto;
        this.#quantidade = 1;
        this.#valor.textContent = "1";
        this.#imagem.src = produto.imagem;
        this.#imagem.alt = produto.rotulo;
        this.#tag.textContent = produto.categoriaNome;
        this.#nome.textContent = produto.rotulo;
        this.#preco.textContent = produto.precoFormatado ?? "Consulte o valor";
        this.#estoque.classList.remove("esgotado");
        if (!produto.temPreco) {
            this.#estoque.textContent = "";
            this.#compra.style.display = "none";
        }
        else if (produto.estaEsgotado) {
            this.#estoque.textContent = "Esgotado";
            this.#estoque.classList.add("esgotado");
            this.#compra.style.display = "flex";
            this.#menos.disabled = true;
            this.#mais.disabled = true;
            this.#adicionar.disabled = true;
            this.#adicionar.textContent = "Esgotado";
        }
        else {
            this.#estoque.textContent = produto.estoque + " em estoque";
            this.#compra.style.display = "flex";
            this.#menos.disabled = false;
            this.#mais.disabled = produto.estoque <= 1;
            this.#adicionar.disabled = false;
            this.#adicionar.textContent = "Adicionar ao carrinho";
        }
        this.abrir();
    }
    #alterarQuantidade(passo) {
        if (!this.#produto)
            return;
        const nova = this.#quantidade + passo;
        if (nova < 1 || nova > this.#produto.estoque)
            return;
        this.#quantidade = nova;
        this.#valor.textContent = String(nova);
        this.#mais.disabled = nova >= this.#produto.estoque;
    }
}
