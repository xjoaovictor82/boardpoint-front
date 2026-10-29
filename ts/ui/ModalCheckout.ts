import type { RespostaPedidoCriado } from "../tipos/Tipos.js";
import type { ServicoPedido } from "../servicos/ServicoPedido.js";
import { formatarMoeda } from "../utilitarios/formatacao.js";
import { obterElemento } from "../utilitarios/dom.js";
import { ModalBase } from "./ModalBase.js";

/** Janela de checkout: coleta os dados do cliente e mostra o PIX (QR Code + copia e cola). */
export class ModalCheckout extends ModalBase {
  readonly #servico: ServicoPedido;
  readonly #passo1 = obterElemento("checkoutPasso1");
  readonly #passo2 = obterElemento("checkoutPasso2");
  readonly #formulario = obterElemento<HTMLFormElement>("formCheckout");
  readonly #botaoGerar = obterElemento<HTMLButtonElement>("botaoGerarPix");
  readonly #qrCode = obterElemento("checkoutQrCode");
  readonly #valor = obterElemento("checkoutValorPix");
  readonly #copiaECola = obterElemento<HTMLInputElement>("checkoutPixCopiaCola");
  readonly #codigo = obterElemento("checkoutCodigoPedido");
  readonly #botaoCopiar = obterElemento<HTMLButtonElement>("botaoCopiarPix");

  constructor(servico: ServicoPedido) {
    super(obterElemento("modalCheckout"));
    this.#servico = servico;

    obterElemento("fundoModalCheckout").addEventListener("click", () => this.fechar());
    obterElemento("fecharModalCheckout").addEventListener("click", () => this.fechar());
    obterElemento("botaoFecharCheckout").addEventListener("click", () => this.fechar());
    this.#formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      void this.#enviar();
    });
    this.#botaoCopiar.addEventListener("click", () => this.#copiar());
  }

  protected override aoAbrir(): void {
    this.#passo1.style.display = "block";
    this.#passo2.style.display = "none";
    this.#formulario.reset();
  }

  async #enviar(): Promise<void> {
    const nome = obterElemento<HTMLInputElement>("checkoutNome").value.trim();
    const telefone = obterElemento<HTMLInputElement>("checkoutTelefone").value.trim();
    const email = obterElemento<HTMLInputElement>("checkoutEmail").value.trim();

    this.#botaoGerar.disabled = true;
    this.#botaoGerar.textContent = "Gerando...";

    try {
      const pedido = await this.#servico.criar({ nome, telefone, email });
      this.#mostrarPix(pedido);
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível criar o pedido. Tente novamente.");
    } finally {
      this.#botaoGerar.disabled = false;
      this.#botaoGerar.textContent = "Gerar PIX";
    }
  }

  #mostrarPix(pedido: RespostaPedidoCriado): void {
    this.#valor.textContent = formatarMoeda(pedido.total);
    this.#copiaECola.value = pedido.pix_payload;
    this.#codigo.textContent = pedido.codigo;

    this.#qrCode.innerHTML = "";
    if (typeof QRCode !== "undefined") {
      new QRCode(this.#qrCode, {
        text: pedido.pix_payload,
        width: 220,
        height: 220,
        colorDark: "#0b0b0b",
        colorLight: "#ffffff",
      });
    }

    this.#passo1.style.display = "none";
    this.#passo2.style.display = "block";
  }

  #copiar(): void {
    this.#copiaECola.select();
    navigator.clipboard.writeText(this.#copiaECola.value).then(() => {
      this.#botaoCopiar.textContent = "Copiado!";
      setTimeout(() => { this.#botaoCopiar.textContent = "Copiar"; }, 2000);
    }).catch(() => {
      document.execCommand("copy");
    });
  }
}
