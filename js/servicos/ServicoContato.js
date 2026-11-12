export class ServicoContato {
    #cliente;
    constructor(cliente) {
        this.#cliente = cliente;
    }
    async enviar(contato) {
        await this.#cliente.enviarJson("publico/contato.php", contato);
    }
}
