import { obterElemento } from "../utilitarios/dom.js";
import { ModalBase } from "./ModalBase.js";
/** Janela "Fale conosco". */
export class ModalContato extends ModalBase {
    #servico;
    #formulario = obterElemento("formContato");
    constructor(servico) {
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
    get fechaComEsc() {
        return true;
    }
    async #enviar() {
        const nome = obterElemento("campoNome").value.trim();
        const email = obterElemento("campoEmailRemetente").value.trim();
        const mensagem = obterElemento("campoMensagem").value.trim();
        const botao = this.#formulario.querySelector(".modal-contato__enviar");
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
        }
        catch (erro) {
            alert(erro instanceof Error ? erro.message : "Não foi possível enviar sua mensagem. Tente novamente.");
        }
        finally {
            if (botao) {
                botao.disabled = false;
                botao.textContent = textoOriginal;
            }
        }
    }
}
