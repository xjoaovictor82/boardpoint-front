import { ErroApi } from "./ErroApi.js";
/** Login recusado ou sessão expirada (HTTP 401). */
export class ErroNaoAutenticado extends ErroApi {
    constructor(mensagem = "Não autenticado. Faça login novamente.") {
        super(mensagem, 401);
    }
}
