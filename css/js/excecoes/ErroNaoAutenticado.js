import { ErroApi } from "./ErroApi.js";
/** Sessão do admin expirada (HTTP 401). */
export class ErroNaoAutenticado extends ErroApi {
    constructor() {
        super("Não autenticado. Faça login novamente.", 401);
    }
}
