import { ClienteApi } from "../repositorios/ClienteApi.js";
import { obterElemento } from "../utilitarios/dom.js";
import { comBotaoOcupado, esconderAlerta, limparErroAoDigitar, mostrarAlerta, mostrarErrosCampos } from "./formulario.js";
import { mensagemAmigavel } from "./mensagens.js";
import { ServicoConta } from "./ServicoConta.js";
import { sessao } from "./SessaoUsuario.js";
import { errosLogin } from "./validacoes.js";
const CAMPOS = ["email", "senha"];
function iniciar() {
    // Quem já está logado não precisa ver a tela de login.
    if (sessao.estaLogado()) {
        window.location.replace("../index.html");
        return;
    }
    const servico = new ServicoConta(new ClienteApi("../admin/api/"), sessao);
    const formulario = obterElemento("formLogin");
    const botao = obterElemento("botaoEntrar");
    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get("cadastro") === "ok") {
        mostrarAlerta("Cadastro realizado com sucesso! Entre com seu e-mail e senha.", "sucesso");
    }
    else if (parametros.get("expirou") === "1") {
        mostrarAlerta("Sua sessão expirou. Entre novamente.", "erro");
    }
    limparErroAoDigitar(CAMPOS);
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        esconderAlerta();
        const email = obterElemento("campo-email").value.trim().toLowerCase();
        const senha = obterElemento("campo-senha").value;
        const erros = errosLogin(email, senha);
        mostrarErrosCampos(CAMPOS, erros);
        if (Object.keys(erros).length > 0)
            return;
        void comBotaoOcupado(botao, "Entrando...", async () => {
            try {
                await servico.entrar(email, senha);
                window.location.href = "../index.html";
            }
            catch (erro) {
                mostrarAlerta(mensagemAmigavel(erro, "login"), "erro");
            }
        });
    });
}
iniciar();
