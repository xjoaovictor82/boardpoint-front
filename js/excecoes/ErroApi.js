import { ErroBoardPoint } from "./ErroBoardPoint.js";
/** A API respondeu, mas com erro (sucesso=false, status HTTP de falha ou corpo que não é JSON). */
export class ErroApi extends ErroBoardPoint {
    #status;
    constructor(mensagem, status) {
        super(mensagem);
        this.#status = status;
    }
    get status() {
        return this.#status;
    }
}
