import type { Preco, ProdutoDto, SlugCategoria } from "../tipos/Tipos.js";
import { formatarPreco } from "../utilitarios/formatacao.js";
import { Entidade } from "./Entidade.js";

/** Produto do catálogo. Imutável: o resto do sistema só lê, nunca altera. */
export class Produto extends Entidade {
  readonly #nome: string;
  readonly #preco: Preco;
  readonly #estoque: number;
  readonly #imagem: string;
  readonly #categoriaSlug: SlugCategoria;
  readonly #categoriaNome: string;

  private constructor(dto: ProdutoDto) {
    super(dto.id);
    this.#nome = dto.nome;
    this.#preco = dto.preco;
    this.#estoque = dto.estoque;
    this.#imagem = dto.imagem;
    this.#categoriaSlug = dto.categoria_slug;
    this.#categoriaNome = dto.categoria_nome;
  }

  static deDto(dto: ProdutoDto): Produto {
    return new Produto(dto);
  }

  get rotulo(): string {
    return this.#nome;
  }

  get preco(): Preco {
    return this.#preco;
  }

  get estoque(): number {
    return this.#estoque;
  }

  get imagem(): string {
    return this.#imagem;
  }

  get categoriaSlug(): SlugCategoria {
    return this.#categoriaSlug;
  }

  get categoriaNome(): string {
    return this.#categoriaNome;
  }

  /** Nome da categoria para agrupar; produtos sem categoria caem em "Outros". */
  get rotuloCategoria(): string {
    return this.#categoriaNome || "Outros";
  }

  get temPreco(): boolean {
    return this.#preco !== null;
  }

  get estaEsgotado(): boolean {
    return this.#estoque <= 0;
  }

  get disponivelParaCompra(): boolean {
    return this.temPreco && !this.estaEsgotado;
  }

  /** Preço em reais, ou null quando o produto é "Consulte o valor". */
  get precoFormatado(): string | null {
    return formatarPreco(this.#preco);
  }

  /** Estoque baixo, mas não zerado (alerta de reposição). */
  temEstoqueCritico(limite: number): boolean {
    return this.#estoque > 0 && this.#estoque <= limite;
  }
}
