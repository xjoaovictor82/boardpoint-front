function ehObjeto(valor) {
    return typeof valor === "object" && valor !== null;
}
/** Confere (em tempo de execução) se um valor lido do localStorage é um item de carrinho válido. */
export function ehItemCarrinhoDto(valor) {
    if (!ehObjeto(valor))
        return false;
    return (Number.isInteger(valor.produto_id) &&
        typeof valor.nome === "string" &&
        typeof valor.preco === "number" && Number.isFinite(valor.preco) &&
        typeof valor.imagem === "string" &&
        Number.isInteger(valor.estoque) &&
        Number.isInteger(valor.quantidade) &&
        valor.quantidade >= 1 &&
        valor.quantidade <= valor.estoque);
}
