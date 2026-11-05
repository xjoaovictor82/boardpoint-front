import { ErroBoardPoint } from "./ErroBoardPoint.js";
/** O servidor não respondeu (sem internet, container fora do ar...). */
export class ErroRede extends ErroBoardPoint {
    constructor() {
        super("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    }
}
