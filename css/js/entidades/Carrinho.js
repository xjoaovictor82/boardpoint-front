import { ErroValidacao } from "../excecoes/ErroValidacao.js";
import { ItemCarrinho } from "./ItemCarrinho.js";
/** Regras do carrinho. A lista interna é privada: quem está fora só recebe cópias. */
export class Carrinho {
    #itens;
    constructor(itens) {
        this.#itens = itens;
    }
    static vazio() {
        return new Carrinho([]);
    }
    static deDtos(dtos) {
        return new Carrinho(dtos.map((dto) => ItemCarrinho.deDto(dto)));
    }
    get itens() {
        return [...this.#itens];
    }
    get estaVazio() {
        return this.#itens.length === 0;
    }
    /** REDUCE — soma a quantidade de todos os itens (número no ícone do carrinho). */
    get totalUnidades() {
        return this.#itens.reduce((soma, item) => soma + item.quantidade, 0);
    }
    /** REDUCE — soma (preço × quantidade) de cada item. */
    get valorTotal() {
        return this.#itens.reduce((soma, item) => soma + item.subtotal, 0);
    }
    /** Soma à quantidade já existente, sem passar do estoque. */
    adicionar(produto, quantidade) {
        if (produto.estaEsgotado) {
            throw new ErroValidacao(`"${produto.rotulo}" está esgotado.`);
        }
        const existente = this.#itens.find((item) => item.produtoId === produto.id);
        const jaNoCarrinho = existente ? existente.quantidade : 0;
        const quantidadeFinal = Math.min(jaNoCarrinho + quantidade, produto.estoque);
        // Recria o item a partir do produto atual: assim preço e estoque ficam em dia.
        const novoItem = ItemCarrinho.deProduto(produto, quantidadeFinal);
        if (existente) {
            this.#itens = this.#itens.map((item) => (item === existente ? novoItem : item));
        }
        else {
            this.#itens.push(novoItem);
        }
    }
    remover(produtoId) {
        // FILTER — reconstrói a lista sem o item removido.
        this.#itens = this.#itens.filter((item) => item.produtoId !== produtoId);
    }
    limpar() {
        this.#itens = [];
    }
    paraDtos() {
        return this.#itens.map((item) => item.paraDto());
    }
}
