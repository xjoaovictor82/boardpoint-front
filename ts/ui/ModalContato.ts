import type { ServicoContato } from "../servicos/ServicoContato.js";
import { obterElemento } from "../utilitarios/dom.js";
import { ModalBase } from "./ModalBase.js";

/** Janela "Fale conosco". */
export class ModalContato extends ModalBase {
  readonly #servico: ServicoContato;
  readonly #formulario = obterElemento<HTMLFormElement>("formContato");

  constructor(servico: ServicoContato) {
    super(obterElemento("modalContato"));
    this.#servico = servico;

    obterElemento("botaoContato").addEventListener("click", () => this.abrir());
    obterElemento("fundoModalContato").addEventListener("click", () => this.fechar());
    obterElemento("fecharModalContato").addEventListener("click", () => this.fechar());
    this.#formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      void this.#enviar();
    });
  }

  protected override get fechaComEsc(): boolean {
    return true;
  }

  async #enviar(): Promise<void> {
    const nome = obterElemento<HTMLInputElement>("campoNome").value.trim();
    const email = obterElemento<HTMLInputElement>("campoEmailRemetente").value.trim();
    const mensagem = obterElemento<HTMLTextAreaElement>("campoMensagem").value.trim();

    const botao = this.#formulario.querySelector<HTMLButtonElement>(".modal-contato__enviar");
    const textoOriginal = botao?.textContent ?? "Enviar mensagem";
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Enviando...";
    }

    try {
      await this.#servico.enviar({ nome, email, mensagem });
      this.fechar();
      this.#formulario.reset();
      alert("Mensagem enviada! Em breve entraremos em contato.");
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível enviar sua mensagem. Tente novamente.");
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.textContent = textoOriginal;
      }
    }
  }
}
