import { ehItemCarrinhoDto } from "../tipos/guardas.js";
import { Carrinho } from "../entidades/Carrinho.js";
/** Converte o que veio do localStorage em itens válidos; itens corrompidos são descartados. */
export function converterItensSalvos(bruto) {
    return Array.isArray(bruto) ? bruto.filter(ehItemCarrinhoDto) : [];
}
/** Casos de uso do carrinho: altera o Carrinho, salva e avisa quem estiver ouvindo. */
export class ServicoCarrinho {
    #armazenamento;
    #ouvintes = [];
    #carrinho;
    constructor(armazenamento) {
        this.#armazenamento = armazenamento;
        this.#carrinho = Carrinho.deDtos(armazenamento.ler());
    }
    get carrinho() {
        return this.#carrinho;
    }
    aoMudar(ouvinte) {
        this.#ouvintes.push(ouvinte);
    }
    adicionar(produto, quantidade) {
        this.#carrinho.adicionar(produto, quantidade);
        this.#persistir();
    }
    remover(produtoId) {
        this.#carrinho.remover(produtoId);
        this.#persistir();
    }
    limpar() {
        this.#carrinho.limpar();
        this.#persistir();
    }
    #persistir() {
        this.#armazenamento.gravar(this.#carrinho.paraDtos());
        this.#ouvintes.forEach((ouvinte) => ouvinte());
    }
}
