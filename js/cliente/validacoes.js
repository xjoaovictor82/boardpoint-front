// Validações do cadastro/perfil do cliente.
// Espelham as regras do back-end (back/api/validacoes.php): mantenha as duas iguais.
export function somenteDigitos(texto) {
    return texto.replace(/\D/g, "");
}
/** Coloca a máscara 000.000.000-00 enquanto a pessoa digita. */
export function formatarCpf(texto) {
    const d = somenteDigitos(texto).slice(0, 11);
    if (d.length <= 3)
        return d;
    if (d.length <= 6)
        return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9)
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
export function validarEmail(email) {
    return email.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
export function validarNome(nome) {
    return nome.length >= 2 && nome.length <= 150;
}
export function validarCpf(cpf) {
    const d = somenteDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d))
        return false;
    for (const tamanho of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) {
            soma += Number(d[i]) * (tamanho + 1 - i);
        }
        const digito = ((soma * 10) % 11) % 10;
        if (digito !== Number(d[tamanho]))
            return false;
    }
    return true;
}
/** Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo. */
export function validarSenha(senha) {
    return (senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /[a-z]/.test(senha) &&
        /\d/.test(senha) &&
        /[\W_]/.test(senha));
}
export const MENSAGEM_SENHA_FORTE = "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.";
export function errosLogin(email, senha) {
    const erros = {};
    if (email === "")
        erros["email"] = "Informe seu e-mail.";
    else if (!validarEmail(email))
        erros["email"] = "E-mail inválido. Exemplo: nome@exemplo.com";
    if (senha === "")
        erros["senha"] = "Informe sua senha.";
    return erros;
}
/**
 * Valida cadastro (senhaObrigatoria = true) ou edição de perfil (false: senha em branco
 * significa "manter a atual"). No perfil o e-mail não é validado aqui, pois não pode mudar.
 */
export function errosConta(campos, senhaObrigatoria, validaEmail) {
    const erros = {};
    if (campos.nome === "")
        erros["nome"] = "Informe seu nome completo.";
    else if (!validarNome(campos.nome))
        erros["nome"] = "O nome deve ter entre 2 e 150 caracteres.";
    if (validaEmail) {
        if (campos.email === "")
            erros["email"] = "Informe seu e-mail.";
        else if (!validarEmail(campos.email))
            erros["email"] = "E-mail inválido. Exemplo: nome@exemplo.com";
    }
    if (somenteDigitos(campos.cpf) === "")
        erros["cpf"] = "Informe seu CPF.";
    else if (!validarCpf(campos.cpf))
        erros["cpf"] = "CPF inválido. Confira os números.";
    if (campos.senha === "") {
        if (senhaObrigatoria)
            erros["senha"] = "Crie uma senha.";
    }
    else if (!validarSenha(campos.senha)) {
        erros["senha"] = MENSAGEM_SENHA_FORTE;
    }
    if (campos.senha !== "" || senhaObrigatoria) {
        if (campos.confirmarSenha === "")
            erros["confirmarSenha"] = "Repita a senha.";
        else if (campos.confirmarSenha !== campos.senha)
            erros["confirmarSenha"] = "As senhas não coincidem.";
    }
    return erros;
}
