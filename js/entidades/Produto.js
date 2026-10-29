var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Produto_nome, _Produto_preco, _Produto_estoque, _Produto_imagem, _Produto_categoriaSlug, _Produto_categoriaNome;
import { formatarPreco } from "../utilitarios/formatacao.js";
import { Entidade } from "./Entidade.js";
/** Produto do catálogo. Imutável: o resto do sistema só lê, nunca altera. */
export class Produto extends Entidade {
    constructor(dto) {
        super(dto.id);
        _Produto_nome.set(this, void 0);
        _Produto_preco.set(this, void 0);
        _Produto_estoque.set(this, void 0);
        _Produto_imagem.set(this, void 0);
        _Produto_categoriaSlug.set(this, void 0);
        _Produto_categoriaNome.set(this, void 0);
        __classPrivateFieldSet(this, _Produto_nome, dto.nome, "f");
        __classPrivateFieldSet(this, _Produto_preco, dto.preco, "f");
        __classPrivateFieldSet(this, _Produto_estoque, dto.estoque, "f");
        __classPrivateFieldSet(this, _Produto_imagem, dto.imagem, "f");
        __classPrivateFieldSet(this, _Produto_categoriaSlug, dto.categoria_slug, "f");
        __classPrivateFieldSet(this, _Produto_categoriaNome, dto.categoria_nome, "f");
    }
    static deDto(dto) {
        return new Produto(dto);
    }
    get rotulo() {
        return __classPrivateFieldGet(this, _Produto_nome, "f");
    }
    get preco() {
        return __classPrivateFieldGet(this, _Produto_preco, "f");
    }
    get estoque() {
        return __classPrivateFieldGet(this, _Produto_estoque, "f");
    }
    get imagem() {
        return __classPrivateFieldGet(this, _Produto_imagem, "f");
    }
    get categoriaSlug() {
        return __classPrivateFieldGet(this, _Produto_categoriaSlug, "f");
    }
    get categoriaNome() {
        return __classPrivateFieldGet(this, _Produto_categoriaNome, "f");
    }
    /** Nome da categoria para agrupar; produtos sem categoria caem em "Outros". */
    get rotuloCategoria() {
        return __classPrivateFieldGet(this, _Produto_categoriaNome, "f") || "Outros";
    }
    get temPreco() {
        return __classPrivateFieldGet(this, _Produto_preco, "f") !== null;
    }
    get estaEsgotado() {
        return __classPrivateFieldGet(this, _Produto_estoque, "f") <= 0;
    }
    get disponivelParaCompra() {
        return this.temPreco && !this.estaEsgotado;
    }
    /** Preço em reais, ou null quando o produto é "Consulte o valor". */
    get precoFormatado() {
        return formatarPreco(__classPrivateFieldGet(this, _Produto_preco, "f"));
    }
    /** Estoque baixo, mas não zerado (alerta de reposição). */
    temEstoqueCritico(limite) {
        return __classPrivateFieldGet(this, _Produto_estoque, "f") > 0 && __classPrivateFieldGet(this, _Produto_estoque, "f") <= limite;
    }
}
_Produto_nome = new WeakMap(), _Produto_preco = new WeakMap(), _Produto_estoque = new WeakMap(), _Produto_imagem = new WeakMap(), _Produto_categoriaSlug = new WeakMap(), _Produto_categoriaNome = new WeakMap();
