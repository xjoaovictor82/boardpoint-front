import type { ClienteHttp, DadosContato } from "../tipos/Tipos.js";

export class ServicoContato {
  readonly #cliente: ClienteHttp;

  constructor(cliente: ClienteHttp) {
    this.#cliente = cliente;
  }

  async enviar(contato: DadosContato): Promise<void> {
    await this.#cliente.enviarJson<null>("publico/contato.php", contato);
  }
}
