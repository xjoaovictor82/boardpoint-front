import { ClienteApi } from "../repositorios/ClienteApi.js";
import { obterElemento } from "../utilitarios/dom.js";
import { comBotaoOcupado, definirErroCampo, esconderAlerta, limparErroAoDigitar, mostrarAlerta, mostrarErrosCampos } from "./formulario.js";
import { mensagemAmigavel } from "./mensagens.js";
import { ServicoConta } from "./ServicoConta.js";
import { sessao } from "./SessaoUsuario.js";
import { errosConta, formatarCpf, validarCpf, type CamposConta } from "./validacoes.js";

const CAMPOS = ["nome", "email", "cpf", "senha", "confirmarSenha"];

function valor(campo: string): string {
  return obterElemento<HTMLInputElement>(`campo-${campo}`).value;
}

function iniciar(): void {
  if (sessao.estaLogado()) {
    window.location.replace("../index.html");
    return;
  }

  const servico = new ServicoConta(new ClienteApi("../admin/api/"), sessao);
  const formulario = obterElemento<HTMLFormElement>("formCadastro");
  const botao = obterElemento<HTMLButtonElement>("botaoCadastrar");
  const campoCpf = obterElemento<HTMLInputElement>("campo-cpf");

  limparErroAoDigitar(CAMPOS);
  campoCpf.addEventListener("input", () => {
    campoCpf.value = formatarCpf(campoCpf.value);
  });
  // Valida o CPF assim que a pessoa sai do campo (campo vazio só reclama ao enviar).
  campoCpf.addEventListener("blur", () => {
    if (campoCpf.value.trim() === "") return;
    definirErroCampo("cpf", validarCpf(campoCpf.value) ? "" : "CPF inválido. Confira os números.");
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    esconderAlerta();

    const campos: CamposConta = {
      nome: valor("nome").trim(),
      email: valor("email").trim().toLowerCase(),
      cpf: valor("cpf"),
      senha: valor("senha"),
      confirmarSenha: valor("confirmarSenha"),
    };

    const erros = errosConta(campos, true, true);
    mostrarErrosCampos(CAMPOS, erros);
    if (Object.keys(erros).length > 0) return;

    void comBotaoOcupado(botao, "Criando conta...", async () => {
      try {
        await servico.cadastrar(campos);
        // Depois do cadastro, vai para o login (a pessoa entra com a conta que acabou de criar).
        window.location.href = "login.html?cadastro=ok";
      } catch (erro) {
        mostrarAlerta(mensagemAmigavel(erro, "cadastro"), "erro");
      }
    });
  });
}

iniciar();