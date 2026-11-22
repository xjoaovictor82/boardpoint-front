/** Base abstrata de tudo o que tem identidade no banco (id). */
export abstract class Entidade {
  readonly #id: number;

  protected constructor(id: number) {
    this.#id = id;
  }

  get id(): number {
    return this.#id;
  }

  /** Texto que representa a entidade para o usuário (cada subclasse define o seu). */
  abstract get rotulo(): string;
}
