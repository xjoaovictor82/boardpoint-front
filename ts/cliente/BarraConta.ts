import { sessao } from "./SessaoUsuario.js";

/** Barra no topo da loja: "Entrar | Cadastrar" ou "Olá, Nome | Sair". */
export class BarraConta {
  readonly #raiz: HTMLElement;

  constructor(raiz: HTMLElement) {
    this.#raiz = raiz;
    sessao.observar(() => this.#desenhar());
    this.#desenhar();
  }

  #desenhar(): void {
    if (sessao.estaLogado()) {
      const primeiroNome = sessao.nome.trim().split(/\s+/)[0] ?? "";
      const ola = this.#link(`Olá, ${primeiroNome || "cliente"}`, "cliente/perfil.html", "conta__botao");
      ola.title = "Meu perfil";

      const sair = document.createElement("button");
      sair.type = "button";
      sair.className = "conta__botao conta__botao--destaque";
      sair.textContent = "Sair";
      sair.addEventListener("click", () => sessao.encerrar());

      this.#raiz.replaceChildren(ola, sair);
    } else {
      this.#raiz.replaceChildren(
        this.#link("Entrar", "cliente/login.html", "conta__botao"),
        this.#link("Cadastrar", "cliente/cadastro.html", "conta__botao conta__botao--destaque"),
      );
    }
  }

  // textContent (e não innerHTML): o nome do usuário nunca é interpretado como HTML.
  #link(texto: string, destino: string, classe: string): HTMLAnchorElement {
    const a = document.createElement("a");
    a.className = classe;
    a.href = destino;
    a.textContent = texto;
    return a;
  }
}