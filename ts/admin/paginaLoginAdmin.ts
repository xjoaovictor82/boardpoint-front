import { ClienteApi } from "../repositorios/ClienteApi.js";
import { obterElemento } from "../utilitarios/dom.js";
import { mensagemAmigavel } from "../cliente/mensagens.js";
import { errosLogin } from "../cliente/validacoes.js";

/** Chave do localStorage onde fica o JWT do ADMIN (diferente da do cliente). */
const CHAVE_TOKEN_ADMIN = "bp_admin_token";

interface RespostaLoginAdmin {
  token: string;
  usuario: string;
}

function iniciar(): void {
  const formulario = obterElemento<HTMLFormElement>("form-login");
  const mensagem = obterElemento<HTMLElement>("mensagem-status");
  const botao = obterElemento<HTMLButtonElement>("botaoEntrar");
  // Página em /admin/login.html -> API em /admin/api/
  const api = new ClienteApi("api/", undefined, CHAVE_TOKEN_ADMIN);

  const mostrarErro = (texto: string): void => {
    mensagem.textContent = texto;
    mensagem.classList.add("ativo");
  };

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensagem.classList.remove("ativo");

    const email = obterElemento<HTMLInputElement>("login-email")
      .value.trim()
      .toLowerCase();
    const senha = obterElemento<HTMLInputElement>("login-senha").value;

    // Valida e-mail (regex) e senha preenchida antes de chamar a API.
    const primeiroErro = Object.values(errosLogin(email, senha))[0];
    if (primeiroErro) {
      mostrarErro(primeiroErro);
      return;
    }

    botao.disabled = true;
    void (async () => {
      try {
        const resposta = await api.enviarJson<RespostaLoginAdmin>(
          "auth.php?acao=login",
          { email, senha },
        );
        localStorage.setItem(CHAVE_TOKEN_ADMIN, resposta.token);
        window.location.href = "pages/dashboard.html";
      } catch (erro) {
        mostrarErro(mensagemAmigavel(erro, "login"));
      } finally {
        botao.disabled = false;
      }
    })();
  });
}

iniciar();
