import type { Armazenamento } from "../tipos/Tipos.js";

/** Guarda um valor de tipo T no localStorage. Dado ausente ou corrompido vira `vazio`. */
export class ArmazenamentoLocal<T> implements Armazenamento<T> {
  readonly #chave: string;
  readonly #vazio: T;
  readonly #converter: (bruto: unknown) => T;

  constructor(chave: string, vazio: T, converter: (bruto: unknown) => T) {
    this.#chave = chave;
    this.#vazio = vazio;
    this.#converter = converter;
  }

  ler(): T {
    try {
      const texto = localStorage.getItem(this.#chave);
      return texto === null ? this.#vazio : this.#converter(JSON.parse(texto));
    } catch {
      return this.#vazio;
    }
  }

  gravar(valor: T): void {
    try {
      localStorage.setItem(this.#chave, JSON.stringify(valor));
    } catch {
      // Armazenamento cheio ou bloqueado (modo privado): o carrinho segue só em memória.
    }
  }
}
