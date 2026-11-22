/** Envia o carrinho ao servidor para virar pedido. O servidor revalida preço e estoque. */
export class ServicoPedido {
    #cliente;
    #carrinho;
    constructor(cliente, carrinho) {
        this.#cliente = cliente;
        this.#carrinho = carrinho;
    }
    async criar(cliente) {
        const itens = this.#carrinho.carrinho.itens.map((item) => ({
            produto_id: item.produtoId,
            quantidade: item.quantidade,
        }));
        const pedido = await this.#cliente.enviarJson("publico/checkout.php", {
            ...cliente,
            itens,
        });
        // O pedido já foi registrado no servidor: esvazia o carrinho.
        this.#carrinho.limpar();
        return pedido;
    }
}
