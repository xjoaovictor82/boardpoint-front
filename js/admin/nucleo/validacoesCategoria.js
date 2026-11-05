const REGEX_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** "Boné Aba Reta" -> "bone-aba-reta" */
export function slugificar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
/** Mesmas regras de categorias.php. Devolve a mensagem do 1º erro ou null se está tudo certo. */
export function erroCategoria(dados) {
    if (dados.nome === "" || dados.slug === "")
        return "Nome e slug são obrigatórios.";
    if (dados.nome.length > 100)
        return "O nome pode ter no máximo 100 caracteres.";
    if (dados.slug.length > 60 || !REGEX_SLUG.test(dados.slug)) {
        return "Slug inválido: use só letras minúsculas, números e hífen (máx. 60).";
    }
    return null;
}
