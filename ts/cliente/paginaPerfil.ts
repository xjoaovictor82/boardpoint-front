import { ErroNaoAutenticado } from "../excecoes/ErroNaoAutenticado.js";
import { ClienteApi } from "../repositorios/ClienteApi.js";
import { obterElemento } from "../utilitarios/dom.js";
import { comBotaoOcupado, esconderAlerta, limparErroAoDigitar, mostrarAlerta, mostrarErrosCampos } from "./formulario.js";
import { mensagemAmigavel } from "./mensagens.js";
import { ServicoConta, type Perfil } from "./ServicoConta.js";
import { sessao } from "./SessaoUsuario.js";
import { errosConta, formatarCpf, type CamposConta } from "./validacoes.js";

// O e-mail não entra aqui: ele aparece bloqueado e não pode ser alterado.
const CAMPOS = ["nome", "cpf", "senha", "confirmarSenha"];

function entrada(campo: string): HTMLInputElement {
  return obterElemento<HTMLInputElement>(`campo-${campo}`);
}

function preencher(perfil: Perfil): void {
  entrada("nome").value = perfil.nome;
  entrada("email").value = perfil.email;
  entrada("cpf").value = formatarCpf(perfil.cpf);
  entrada("senha").value = "";
  entrada("confirmarSenha").value = "";
}

function voltarAoLogin(): void {
  window.location.replace("login.html?expirou=1");
}

async function iniciar(): Promise<void> {
  // Rota protegida: sem login, volta para a tela de entrada.
  if (!sessao.estaLogado()) {
    voltarAoLogin();
    return;
  }

  const servico = new ServicoConta(new ClienteApi("../admin/api/", () => sessao.encerrar()), sessao);
  const formulario = obterElemento<HTMLFormElement>("formPerfil");
  const botao = obterElemento<HTMLButtonElement>("botaoSalvar");
  let perfil: Perfil;

  try {
    perfil = await servico.obterPerfil();
  } catch (erro) {
    if (erro instanceof ErroNaoAutenticado) {
      voltarAoLogin();
    } else {
      mostrarAlerta(mensagemAmigavel(erro, "perfil"), "erro");
    }
    return;
  }

  preencher(perfil);
  formulario.hidden = false;

  limparErroAoDigitar(CAMPOS);
  entrada("cpf").addEventListener("input", () => {
    entrada("cpf").value = formatarCpf(entrada("cpf").value);
  });

  obterElemento("botaoSair").addEventListener("click", () => {
    servico.sair();
    window.location.href = "../index.html";
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    esconderAlerta();

    const campos: CamposConta = {
      nome: entrada("nome").value.trim(),
      email: perfil.email,
      cpf: entrada("cpf").value,
      senha: entrada("senha").value,
      confirmarSenha: entrada("confirmarSenha").value,
    };

    const erros = errosConta(campos, false, false);
    mostrarErrosCampos(CAMPOS, erros);
    if (Object.keys(erros).length > 0) return;

    void comBotaoOcupado(botao, "Salvando...", async () => {
      try {
        perfil = await servico.atualizarPerfil(perfil.email, campos);
        preencher(perfil);
        mostrarAlerta("Perfil atualizado com sucesso!", "sucesso");
      } catch (erro) {
        if (erro instanceof ErroNaoAutenticado) {
          voltarAoLogin();
          return;
        }
        mostrarAlerta(mensagemAmigavel(erro, "perfil"), "erro");
      }
    });
  });
}

void iniciar();