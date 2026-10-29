import type { CategoriaDto, SlugCategoria } from "../tipos/Tipos.js";
import { Entidade } from "./Entidade.js";

export class Categoria extends Entidade {
  readonly #slug: SlugCategoria;
  readonly #nome: string;

  private constructor(id: number, slug: SlugCategoria, nome: string) {
    super(id);
    this.#slug = slug;
    this.#nome = nome;
  }

  static deDto(dto: CategoriaDto): Categoria {
    return new Categoria(dto.id, dto.slug, dto.nome);
  }

  get slug(): SlugCategoria {
    return this.#slug;
  }

  get rotulo(): string {
    return this.#nome;
  }
}
