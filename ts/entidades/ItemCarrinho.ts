import type { ItemCarrinhoDto } from "../tipos/Tipos.js";
import { ErroValidacao } from "../excecoes/ErroValidacao.js";
import { Produto } from "./Produto.js";

/** Um produto dentro do carrinho, com a quantidade escolhida. */
export class ItemCarrinho {
  readonly #produtoId: number;
  readonly #nome: string;
  readonly #preco: number;
  readonly #imagem: string;
  readonly #estoque: number;
  #quantidade: number;

  private constructor(dto: ItemCarrinhoDto) {
    this.#produtoId = dto.produto_id;
    this.#nome = dto.nome;
    this.#preco = dto.preco;
    this.#imagem = dto.imagem;
    this.#estoque = dto.estoque;
    this.#quantidade = 1;
    this.quantidade = dto.quantidade; // passa pela validação do setter
  }

  static deProduto(produto: Produto, quantidade: number): ItemCarrinho {
    if (produto.preco === null) {
      throw new ErroValidacao(`"${produto.rotulo}" está sob consulta e não pode ser comprado online.`);
    }
    return new ItemCarrinho({
      produto_id: produto.id,
      nome: produto.rotulo,
      preco: produto.preco,
      imagem: produto.imagem,
      estoque: produto.estoque,
      quantidade,
    });
  }

  static deDto(dto: ItemCarrinhoDto): ItemCarrinho {
    return new ItemCarrinho(dto);
  }

  get produtoId(): number {
    return this.#produtoId;
  }

  get nome(): string {
    return this.#nome;
  }

  get preco(): number {
    return this.#preco;
  }

  get imagem(): string {
    return this.#imagem;
  }

  get estoque(): number {
    return this.#estoque;
  }

  get quantidade(): number {
    return this.#quantidade;
  }

  /** Único setter do sistema: existe porque valida (inteiro, mínimo 1, máximo o estoque). */
  set quantidade(valor: number) {
    if (!Number.isInteger(valor) || valor < 1) {
      throw new ErroValidacao("A quantidade deve ser um número inteiro maior que zero.");
    }
    if (valor > this.#estoque) {
      throw new ErroValidacao(`Estoque insuficiente para "${this.#nome}".`);
    }
    this.#quantidade = valor;
  }

  get subtotal(): number {
    return this.#preco * this.#quantidade;
  }

  paraDto(): ItemCarrinhoDto {
    return {
      produto_id: this.#produtoId,
      nome: this.#nome,
      preco: this.#preco,
      imagem: this.#imagem,
      estoque: this.#estoque,
      quantidade: this.#quantidade,
    };
  }
}
