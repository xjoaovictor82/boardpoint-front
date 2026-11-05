import { obterElemento } from "../utilitarios/dom.js";
/** Mostra (ou limpa) a mensagem de erro embaixo de um campo. O <small> chama `erro-<campo>`. */
export function definirErroCampo(campo, mensagem) {
    const aviso = obterElemento(`erro-${campo}`);
    const entrada = obterElemento(`campo-${campo}`);
    aviso.textContent = mensagem;
    entrada.classList.toggle("campo__entrada--erro", mensagem !== "");
    entrada.setAttribute("aria-invalid", mensagem !== "" ? "true" : "false");
}
export function mostrarErrosCampos(campos, erros) {
    for (const campo of campos) {
        definirErroCampo(campo, erros[campo] ?? "");
    }
}
export function limparErroAoDigitar(campos) {
    for (const campo of campos) {
        obterElemento(`campo-${campo}`).addEventListener("input", () => definirErroCampo(campo, ""));
    }
}
export function mostrarAlerta(texto, tipo) {
    const alerta = obterElemento("alerta");
    alerta.textContent = texto;
    alerta.className = `alerta alerta--${tipo}`;
    alerta.hidden = false;
}
export function esconderAlerta() {
    obterElemento("alerta").hidden = true;
}
/** Trava o botão enquanto a requisição está em andamento (evita clique duplo). */
export async function comBotaoOcupado(botao, textoOcupado, acao) {
    const textoOriginal = botao.textContent ?? "";
    botao.disabled = true;
    botao.textContent = textoOcupado;
    try {
        await acao();
    }
    finally {
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}
