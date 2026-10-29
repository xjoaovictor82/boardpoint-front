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
var _ClienteApi_instances, _ClienteApi_base, _ClienteApi_aoNaoAutenticado, _ClienteApi_requisitar;
import { ErroApi } from "../excecoes/ErroApi.js";
import { ErroNaoAutenticado } from "../excecoes/ErroNaoAutenticado.js";
import { ErroRede } from "../excecoes/ErroRede.js";
/** Fala com a API PHP. Transforma qualquer falha em um erro tipado (ErroRede, ErroApi...). */
export class ClienteApi {
    constructor(base, aoNaoAutenticado) {
        _ClienteApi_instances.add(this);
        _ClienteApi_base.set(this, void 0);
        _ClienteApi_aoNaoAutenticado.set(this, void 0);
        __classPrivateFieldSet(this, _ClienteApi_base, base, "f");
        __classPrivateFieldSet(this, _ClienteApi_aoNaoAutenticado, aoNaoAutenticado, "f");
    }
    obter(caminho) {
        return __classPrivateFieldGet(this, _ClienteApi_instances, "m", _ClienteApi_requisitar).call(this, caminho, {});
    }
    enviarJson(caminho, corpo) {
        return __classPrivateFieldGet(this, _ClienteApi_instances, "m", _ClienteApi_requisitar).call(this, caminho, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
        });
    }
}
_ClienteApi_base = new WeakMap(), _ClienteApi_aoNaoAutenticado = new WeakMap(), _ClienteApi_instances = new WeakSet(), _ClienteApi_requisitar = async function _ClienteApi_requisitar(caminho, opcoes) {
    let resposta;
    // 1. Busca o Token do localStorage
    const token = localStorage.getItem("bp_jwt_token");
    // 2. Prepara os cabeçalhos incluindo a autenticação Bearer
    const headers = new Headers(opcoes.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    try {
        resposta = await fetch(__classPrivateFieldGet(this, _ClienteApi_base, "f") + caminho, {
            credentials: "same-origin",
            ...opcoes,
            headers, // Adiciona os cabeçalhos com o JWT
        });
    }
    catch {
        throw new ErroRede();
    }
    let corpo;
    try {
        corpo = (await resposta.json());
    }
    catch {
        throw new ErroApi("O servidor devolveu uma resposta inesperada.", resposta.status);
    }
    if (resposta.status === 401) {
        __classPrivateFieldGet(this, _ClienteApi_aoNaoAutenticado, "f")?.call(this);
        throw new ErroNaoAutenticado();
    }
    if (!resposta.ok || !corpo.sucesso) {
        throw new ErroApi(corpo.erro || "A requisição falhou.", resposta.status);
    }
    return corpo.dados;
};
