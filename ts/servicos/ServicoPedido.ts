import type { ClienteHttp, DadosCliente, RespostaPedidoCriado } from "../tipos/Tipos.js";
import { ServicoCarrinho } from "./ServicoCarrinho.js";

/** Envia o carrinho ao servidor para virar pedido. O servidor revalida preço e estoque. */
export class ServicoPedido {
  readonly #cliente: ClienteHttp;
  readonly #carrinho: ServicoCarrinho;

  constructor(cliente: ClienteHttp, carrinho: ServicoCarrinho) {
    this.#cliente = cliente;
    this.#carrinho = carrinho;
  }

  async criar(cliente: DadosCliente): Promise<RespostaPedidoCriado> {
    const itens = this.#carrinho.carrinho.itens.map((item) => ({
      produto_id: item.produtoId,
      quantidade: item.quantidade,
    }));

    const pedido = await this.#cliente.enviarJson<RespostaPedidoCriado>("pedidos.php?acao=criar", {
      ...cliente,
      itens,
    });

    // O pedido já foi registrado no servidor: esvazia o carrinho.
    this.#carrinho.limpar();
    return pedido;
  }
}
