import { ErroValidacao } from "../excecoes/ErroValidacao.js";
/** Um produto dentro do carrinho, com a quantidade escolhida. */
export class ItemCarrinho {
    #produtoId;
    #nome;
    #preco;
    #imagem;
    #estoque;
    #quantidade;
    constructor(dto) {
        this.#produtoId = dto.produto_id;
        this.#nome = dto.nome;
        this.#preco = dto.preco;
        this.#imagem = dto.imagem;
        this.#estoque = dto.estoque;
        this.#quantidade = 1;
        this.quantidade = dto.quantidade; // passa pela validação do setter
    }
    static deProduto(produto, quantidade) {
        if (produto.preco === null) {
            throw new ErroValidacao(`"${produto.rotulo}" está sob consulta e não pode ser comprado online.`);
        }
        return new ItemCarrinho({
            produto_id: produto.id,
            nome: produto.rotulo,
            preco: produto.preco,
            imagem: produto.imagem,
            estoque: produto.estoque,
            quantidade,
        });
    }
    static deDto(dto) {
        return new ItemCarrinho(dto);
    }
    get produtoId() {
        return this.#produtoId;
    }
    get nome() {
        return this.#nome;
    }
    get preco() {
        return this.#preco;
    }
    get imagem() {
        return this.#imagem;
    }
    get estoque() {
        return this.#estoque;
    }
    get quantidade() {
        return this.#quantidade;
    }
    /** Único setter do sistema: existe porque valida (inteiro, mínimo 1, máximo o estoque). */
    set quantidade(valor) {
        if (!Number.isInteger(valor) || valor < 1) {
            throw new ErroValidacao("A quantidade deve ser um número inteiro maior que zero.");
        }
        if (valor > this.#estoque) {
            throw new ErroValidacao(`Estoque insuficiente para "${this.#nome}".`);
        }
        this.#quantidade = valor;
    }
    get subtotal() {
        return this.#preco * this.#quantidade;
    }
    paraDto() {
        return {
            produto_id: this.#produtoId,
            nome: this.#nome,
            preco: this.#preco,
            imagem: this.#imagem,
            estoque: this.#estoque,
            quantidade: this.#quantidade,
        };
    }
}
