const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
/** Valor em reais; devolve null quando não há preço ("Consulte o valor"). */
export function formatarPreco(preco) {
    if (preco === null || preco === undefined)
        return null;
    return MOEDA.format(preco);
}
export function formatarMoeda(valor) {
    return MOEDA.format(valor);
}
/** Escapa texto vindo do banco antes de colocá-lo em innerHTML (evita injeção de HTML). */
export function escaparHtml(texto) {
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
