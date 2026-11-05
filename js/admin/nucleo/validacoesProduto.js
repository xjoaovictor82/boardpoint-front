const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_IMAGEM = 10 * 1024 * 1024; // o Nginx aceita até 10 MB (client_max_body_size)
/** Aceita "199.90" ou "199,90". Vazio = sem preço ("Consulte o valor"). NaN = inválido. */
function lerPreco(texto) {
    const limpo = texto.trim().replace(",", ".");
    return limpo === "" ? null : Number(limpo);
}
/** Mesmas regras de produtos.php. Devolve a 1ª mensagem de erro ou null. */
export function erroProduto(campos, edicao) {
    if (campos.nome === "" || campos.categoria === "")
        return "Categoria e nome são obrigatórios.";
    if (campos.nome.length > 150)
        return "O nome pode ter no máximo 150 caracteres.";
    const preco = lerPreco(campos.preco);
    if (preco !== null && (Number.isNaN(preco) || preco < 0 || preco > 99999999.99))
        return "Preço inválido.";
    if (!/^\d+$/.test(campos.estoque.trim()) || Number(campos.estoque) > 1_000_000) {
        return "Estoque inválido: use um número inteiro maior ou igual a zero.";
    }
    if (campos.imagem === null) {
        return edicao ? null : "A imagem é obrigatória para um novo produto.";
    }
    if (!TIPOS_IMAGEM.includes(campos.imagem.type))
        return "Formato de imagem não suportado. Use JPG, PNG ou WEBP.";
    if (campos.imagem.size > TAMANHO_MAXIMO_IMAGEM)
        return "A imagem pode ter no máximo 10 MB.";
    return null;
}
/** Converte os textos do formulário no objeto enviado à API (chame só depois de `erroProduto`). */
export function paraEntradaProduto(campos) {
    return {
        categoria_id: Number(campos.categoria),
        nome: campos.nome,
        preco: lerPreco(campos.preco),
        estoque: Number(campos.estoque),
        imagem: campos.imagem,
    };
}
