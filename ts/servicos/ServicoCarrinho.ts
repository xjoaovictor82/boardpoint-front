import type { Armazenamento, ItemCarrinhoDto, Ouvinte } from "../tipos/Tipos.js";
import { ehItemCarrinhoDto } from "../tipos/guardas.js";
import { Carrinho } from "../entidades/Carrinho.js";
import { Produto } from "../entidades/Produto.js";

/** Converte o que veio do localStorage em itens válidos; itens corrompidos são descartados. */
export function converterItensSalvos(bruto: unknown): ItemCarrinhoDto[] {
  return Array.isArray(bruto) ? bruto.filter(ehItemCarrinhoDto) : [];
}

/** Casos de uso do carrinho: altera o Carrinho, salva e avisa quem estiver ouvindo. */
export class ServicoCarrinho {
  readonly #armazenamento: Armazenamento<ItemCarrinhoDto[]>;
  readonly #ouvintes: Ouvinte[] = [];
  #carrinho: Carrinho;

  constructor(armazenamento: Armazenamento<ItemCarrinhoDto[]>) {
    this.#armazenamento = armazenamento;
    this.#carrinho = Carrinho.deDtos(armazenamento.ler());
  }

  get carrinho(): Carrinho {
    return this.#carrinho;
  }

  aoMudar(ouvinte: Ouvinte): void {
    this.#ouvintes.push(ouvinte);
  }

  adicionar(produto: Produto, quantidade: number): void {
    this.#carrinho.adicionar(produto, quantidade);
    this.#persistir();
  }

  remover(produtoId: number): void {
    this.#carrinho.remover(produtoId);
    this.#persistir();
  }

  limpar(): void {
    this.#carrinho.limpar();
    this.#persistir();
  }

  #persistir(): void {
    this.#armazenamento.gravar(this.#carrinho.paraDtos());
    this.#ouvintes.forEach((ouvinte) => ouvinte());
  }
}
