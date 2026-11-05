import { ErroBoardPoint } from "./ErroBoardPoint.js";
/** O HTML não tem o elemento que o script espera (id digitado errado, página trocada...). */
export class ErroElementoNaoEncontrado extends ErroBoardPoint {
    constructor(id) {
        super(`Elemento #${id} não encontrado na página.`);
    }
}
