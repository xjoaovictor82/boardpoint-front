import type { ItemCarrinhoDto } from "../tipos/Tipos.js";
import { ErroValidacao } from "../excecoes/ErroValidacao.js";
import { ItemCarrinho } from "./ItemCarrinho.js";
import { Produto } from "./Produto.js";

/** Regras do carrinho. A lista interna é privada: quem está fora só recebe cópias. */
export class Carrinho {
  #itens: ItemCarrinho[];

  private constructor(itens: ItemCarrinho[]) {
    this.#itens = itens;
  }

  static vazio(): Carrinho {
    return new Carrinho([]);
  }

  static deDtos(dtos: readonly ItemCarrinhoDto[]): Carrinho {
    return new Carrinho(dtos.map((dto) => ItemCarrinho.deDto(dto)));
  }

  get itens(): readonly ItemCarrinho[] {
    return [...this.#itens];
  }

  get estaVazio(): boolean {
    return this.#itens.length === 0;
  }

  /** REDUCE — soma a quantidade de todos os itens (número no ícone do carrinho). */
  get totalUnidades(): number {
    return this.#itens.reduce((soma, item) => soma + item.quantidade, 0);
  }

  /** REDUCE — soma (preço × quantidade) de cada item. */
  get valorTotal(): number {
    return this.#itens.reduce((soma, item) => soma + item.subtotal, 0);
  }

  /** Soma à quantidade já existente, sem passar do estoque. */
  adicionar(produto: Produto, quantidade: number): void {
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
    } else {
      this.#itens.push(novoItem);
    }
  }

  remover(produtoId: number): void {
    // FILTER — reconstrói a lista sem o item removido.
    this.#itens = this.#itens.filter((item) => item.produtoId !== produtoId);
  }

  limpar(): void {
    this.#itens = [];
  }

  paraDtos(): ItemCarrinhoDto[] {
    return this.#itens.map((item) => item.paraDto());
  }
}
