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
var _Categoria_slug, _Categoria_nome;
import { Entidade } from "./Entidade.js";
export class Categoria extends Entidade {
    constructor(id, slug, nome) {
        super(id);
        _Categoria_slug.set(this, void 0);
        _Categoria_nome.set(this, void 0);
        __classPrivateFieldSet(this, _Categoria_slug, slug, "f");
        __classPrivateFieldSet(this, _Categoria_nome, nome, "f");
    }
    static deDto(dto) {
        return new Categoria(dto.id, dto.slug, dto.nome);
    }
    get slug() {
        return __classPrivateFieldGet(this, _Categoria_slug, "f");
    }
    get rotulo() {
        return __classPrivateFieldGet(this, _Categoria_nome, "f");
    }
}
_Categoria_slug = new WeakMap(), _Categoria_nome = new WeakMap();
