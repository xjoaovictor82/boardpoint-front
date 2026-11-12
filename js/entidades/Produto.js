import { formatarPreco } from "../utilitarios/formatacao.js";
import { Entidade } from "./Entidade.js";
/** Produto do catálogo. Imutável: o resto do sistema só lê, nunca altera. */
export class Produto extends Entidade {
    #nome;
    #preco;
    #estoque;
    #imagem;
    #categoriaSlug;
    #categoriaNome;
    constructor(dto) {
        super(dto.id);
        this.#nome = dto.nome;
        this.#preco = dto.preco;
        this.#estoque = dto.estoque;
        this.#imagem = dto.imagem;
        this.#categoriaSlug = dto.categoria_slug;
        this.#categoriaNome = dto.categoria_nome;
    }
    static deDto(dto) {
        return new Produto(dto);
    }
    get rotulo() {
        return this.#nome;
    }
    get preco() {
        return this.#preco;
    }
    get estoque() {
        return this.#estoque;
    }
    get imagem() {
        return this.#imagem;
    }
    get categoriaSlug() {
        return this.#categoriaSlug;
    }
    get categoriaNome() {
        return this.#categoriaNome;
    }
    /** Nome da categoria para agrupar; produtos sem categoria caem em "Outros". */
    get rotuloCategoria() {
        return this.#categoriaNome || "Outros";
    }
    get temPreco() {
        return this.#preco !== null;
    }
    get estaEsgotado() {
        return this.#estoque <= 0;
    }
    get disponivelParaCompra() {
        return this.temPreco && !this.estaEsgotado;
    }
    /** Preço em reais, ou null quando o produto é "Consulte o valor". */
    get precoFormatado() {
        return formatarPreco(this.#preco);
    }
    /** Estoque baixo, mas não zerado (alerta de reposição). */
    temEstoqueCritico(limite) {
        return this.#estoque > 0 && this.#estoque <= limite;
    }
}
