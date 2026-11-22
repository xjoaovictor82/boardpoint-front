import { ClienteApi } from "../repositorios/ClienteApi.js";
import { obterElemento } from "../utilitarios/dom.js";
import { comBotaoOcupado, definirErroCampo, esconderAlerta, limparErroAoDigitar, mostrarAlerta, mostrarErrosCampos } from "./formulario.js";
import { mensagemAmigavel } from "./mensagens.js";
import { ativarOlhosDeSenha, mostrarSenha } from "./olhoSenha.js";
import { ServicoConta } from "./ServicoConta.js";
import { sessao } from "./SessaoUsuario.js";
import { errosConta, formatarCpf, validarCpf, type CamposConta } from "./validacoes.js";

const CAMPOS = ["nome", "email", "cpf", "senha", "confirmarSenha"];

function valor(campo: string): string {
  return obterElemento<HTMLInputElement>(`campo-${campo}`).value;
}

/** Copia o texto para a área de transferência. Devolve false se o navegador não deixar. */
async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

function iniciar(): void {
  if (sessao.estaLogado()) {
    window.location.replace("../index.html");
    return;
  }

  ativarOlhosDeSenha();

  const api = new ClienteApi("../admin/api/");
  const servico = new ServicoConta(api, sessao);
  const formulario = obterElemento<HTMLFormElement>("formCadastro");
  const botao = obterElemento<HTMLButtonElement>("botaoCadastrar");
  const campoCpf = obterElemento<HTMLInputElement>("campo-cpf");
  const botaoSugerir = obterElemento<HTMLButtonElement>("botaoSugerirSenha");
  const botaoCopiar = obterElemento<HTMLButtonElement>("botaoCopiarSenha");
  const campoSenha = obterElemento<HTMLInputElement>("campo-senha");
  const campoConfirmar = obterElemento<HTMLInputElement>("campo-confirmarSenha");

  limparErroAoDigitar(CAMPOS);
  campoCpf.addEventListener("input", () => {
    campoCpf.value = formatarCpf(campoCpf.value);
  });
  // Valida o CPF assim que a pessoa sai do campo (campo vazio só reclama ao enviar).
  campoCpf.addEventListener("blur", () => {
    if (campoCpf.value.trim() === "") return;
    definirErroCampo("cpf", validarCpf(campoCpf.value) ? "" : "CPF inválido. Confira os números.");
  });

  botaoSugerir.addEventListener("click", () => {
    esconderAlerta();
    void comBotaoOcupado(botaoSugerir, "Gerando...", async () => {
      try {
        const { senha } = await api.enviarJson<{ senha: string }>("clientes.php?acao=sugerir-senha", {});
        // Deixa a senha visível (olho aberto) para a pessoa guardar antes de criar a conta.
        mostrarSenha(campoSenha, true);
        mostrarSenha(campoConfirmar, true);
        campoSenha.value = senha;
        campoConfirmar.value = senha;
        definirErroCampo("senha", "");
        definirErroCampo("confirmarSenha", "");
        botaoCopiar.hidden = false;
        mostrarAlerta("Senha sugerida preenchida. Copie e guarde em um lugar seguro antes de criar a conta.", "sucesso");
      } catch (erro) {
        mostrarAlerta(mensagemAmigavel(erro, "cadastro"), "erro");
      }
    });
  });

  botaoCopiar.addEventListener("click", () => {
    if (campoSenha.value === "") return;
    void copiarTexto(campoSenha.value).then((copiou) => {
      if (copiou) {
        mostrarAlerta("Senha copiada! Cole em um lugar seguro antes de criar a conta.", "sucesso");
      } else {
        campoSenha.select();
        mostrarAlerta("Não foi possível copiar sozinho. A senha está selecionada: aperte Ctrl+C.", "erro");
      }
    });
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