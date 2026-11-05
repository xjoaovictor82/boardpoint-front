import { ErroValidacao } from "../excecoes/ErroValidacao.js";
import { errosConta, errosLogin, somenteDigitos } from "./validacoes.js";
function primeiroErro(erros) {
    return Object.values(erros)[0];
}
/** Regras de conta do cliente: entrar, cadastrar, ver e editar o próprio perfil. */
export class ServicoConta {
    #http;
    #sessao;
    constructor(http, sessao) {
        this.#http = http;
        this.#sessao = sessao;
    }
    async entrar(email, senha) {
        const erro = primeiroErro(errosLogin(email, senha));
        if (erro)
            throw new ErroValidacao(erro);
        const resposta = await this.#http.enviarJson("clientes.php?acao=login", { email, senha });
        this.#sessao.iniciar(resposta.token, resposta.nome);
    }
    async cadastrar(campos) {
        const erro = primeiroErro(errosConta(campos, true, true));
        if (erro)
            throw new ErroValidacao(erro);
        await this.#http.enviarJson("clientes.php?acao=registrar", {
            nome: campos.nome,
            email: campos.email,
            cpf: somenteDigitos(campos.cpf),
            senha: campos.senha,
        });
    }
    obterPerfil() {
        return this.#http.obter("clientes.php?acao=perfil");
    }
    /** O e-mail é enviado só porque o servidor o exige igual ao cadastrado: ele não pode mudar. */
    async atualizarPerfil(emailAtual, campos) {
        const erro = primeiroErro(errosConta(campos, false, false));
        if (erro)
            throw new ErroValidacao(erro);
        const corpo = {
            nome: campos.nome,
            email: emailAtual,
            cpf: somenteDigitos(campos.cpf),
        };
        if (campos.senha !== "")
            corpo["senha"] = campos.senha;
        const perfil = await this.#http.atualizarJson("clientes.php?acao=perfil", corpo);
        this.#sessao.definirNome(perfil.nome);
        return perfil;
    }
    sair() {
        this.#sessao.encerrar();
    }
}
