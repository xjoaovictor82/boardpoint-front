import { ErroElementoNaoEncontrado } from "../excecoes/ErroElementoNaoEncontrado.js";
/** Busca um elemento por id e lança erro claro se não existir (em vez de `null` silencioso). */
export function obterElemento(id) {
    const elemento = document.getElementById(id);
    if (elemento === null)
        throw new ErroElementoNaoEncontrado(id);
    return elemento;
}
