import type { Ouvinte } from "../tipos/Tipos";

/** Chave do localStorage onde fica o JWT do ADMIN (diferente da do cliente, bp_jwt_token). */
export const CHAVE_TOKEN_ADMIN = "bp_admin_token";
const CHAVE_NOME_ADMIN = "bp_admin_nome";

/**
 * "Contexto" do administrador logado: guarda token + nome e avisa quem estiver ouvindo
 * quando isso muda. Uma só instância para o painel inteiro (fica em infra/servicosAdmin.ts).
 * Equivale à antiga SessaoAdmin do site estático, mas observável (como SessaoUsuario).
 */
export class SessaoAdmin {
  readonly #ouvintes = new Set<Ouvinte>();
  #versao = 0;
  #token: string | null = null;
  #nome = "";

  constructor() {
    this.#carregar();
    // Login/logout em outra aba atualiza esta também.
    window.addEventListener("storage", (evento) => {
      if (evento.key === CHAVE_TOKEN_ADMIN || evento.key === CHAVE_NOME_ADMIN || evento.key === null) {
        this.#carregar();
        this.#avisar();
      }
    });
  }

  /** Número que sobe a cada mudança de sessão: serve de "foto" do estado para o React. */
  get versao(): number {
    return this.#versao;
  }

  get token(): string | null {
    return this.#token;
  }

  get nome(): string {
    return this.#nome;
  }

  estaLogado(): boolean {
    return this.#token !== null;
  }

  iniciar(token: string, nome: string): void {
    this.#token = token;
    this.#nome = nome;
    this.#gravar();
    this.#avisar();
  }

  definirNome(nome: string): void {
    this.#nome = nome;
    this.#gravar();
    this.#avisar();
  }

  encerrar(): void {
    this.#token = null;
    this.#nome = "";
    this.#gravar();
    this.#avisar();
  }

  /** Registra quem quer ser avisado. Devolve uma função para cancelar. */
  observar(ouvinte: Ouvinte): () => void {
    this.#ouvintes.add(ouvinte);
    return () => this.#ouvintes.delete(ouvinte);
  }

  #avisar(): void {
    this.#versao += 1;
    this.#ouvintes.forEach((ouvinte) => ouvinte());
  }

  #carregar(): void {
    try {
      this.#token = localStorage.getItem(CHAVE_TOKEN_ADMIN);
      this.#nome = localStorage.getItem(CHAVE_NOME_ADMIN) ?? "";
    } catch {
      this.#token = null;
      this.#nome = "";
    }
  }

  #gravar(): void {
    try {
      if (this.#token === null) {
        localStorage.removeItem(CHAVE_TOKEN_ADMIN);
        localStorage.removeItem(CHAVE_NOME_ADMIN);
      } else {
        localStorage.setItem(CHAVE_TOKEN_ADMIN, this.#token);
        localStorage.setItem(CHAVE_NOME_ADMIN, this.#nome);
      }
    } catch {
      // Armazenamento bloqueado: a sessão vale só até fechar a aba.
    }
  }
}
