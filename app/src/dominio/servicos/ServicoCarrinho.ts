import type { Armazenamento, ItemCarrinhoDto, Ouvinte } from "../tipos/Tipos";
import { ehItemCarrinhoDto } from "../tipos/guardas";
import { Carrinho } from "../entidades/Carrinho";
import { Produto } from "../entidades/Produto";

/** Converte o que veio do localStorage em itens válidos; itens corrompidos são descartados. */
export function converterItensSalvos(bruto: unknown): ItemCarrinhoDto[] {
  return Array.isArray(bruto) ? bruto.filter(ehItemCarrinhoDto) : [];
}

/** Casos de uso do carrinho: altera o Carrinho, salva e avisa quem estiver ouvindo. */
export class ServicoCarrinho {
  readonly #armazenamento: Armazenamento<ItemCarrinhoDto[]>;
  readonly #ouvintes: Ouvinte[] = [];
  #carrinho: Carrinho;
  #versao = 0;

  constructor(armazenamento: Armazenamento<ItemCarrinhoDto[]>) {
    this.#armazenamento = armazenamento;
    this.#carrinho = Carrinho.deDtos(armazenamento.ler());
  }

  get carrinho(): Carrinho {
    return this.#carrinho;
  }

  /** Número que sobe a cada alteração: serve de "foto" do estado para quem observa (React). */
  get versao(): number {
    return this.#versao;
  }

  /** Registra um ouvinte e devolve a função que o remove. */
  aoMudar(ouvinte: Ouvinte): () => void {
    this.#ouvintes.push(ouvinte);
    return () => {
      const posicao = this.#ouvintes.indexOf(ouvinte);
      if (posicao >= 0) this.#ouvintes.splice(posicao, 1);
    };
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
    this.#versao += 1;
    this.#armazenamento.gravar(this.#carrinho.paraDtos());
    this.#ouvintes.forEach((ouvinte) => ouvinte());
  }
}
