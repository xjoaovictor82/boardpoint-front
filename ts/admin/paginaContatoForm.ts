import { validarEmail } from "../cliente/validacoes.js";
import { obterElemento } from "../utilitarios/dom.js";
import { iniciarPaginaAdmin } from "./nucleo/iniciarPaginaAdmin.js";
import { ServicoCrud } from "./nucleo/ServicoCrud.js";
import { mostrarToast } from "./nucleo/Toast.js";
import { irPara, lerIdDaUrl, mensagemDeErro } from "./nucleo/elementos.js";
import type { ContatoAdmin, EntradaContato } from "./nucleo/tipos.js";

/** Mesmas regras de contato.php. Devolve a 1ª mensagem de erro ou null. */
function erroContato(dados: EntradaContato): string | null {
  if (dados.nome === "" || dados.email === "" || dados.mensagem === "") return "Preencha nome, e-mail e mensagem.";
  if (dados.nome.length > 150) return "O nome pode ter no máximo 150 caracteres.";
  if (!validarEmail(dados.email)) return "E-mail inválido. Exemplo: nome@exemplo.com";
  if (dados.mensagem.length > 5000) return "A mensagem pode ter no máximo 5000 caracteres.";
  return null;
}

async function iniciar(): Promise<void> {
  const contexto = await iniciarPaginaAdmin();
  if (contexto === null) return;

  const servico = new ServicoCrud<ContatoAdmin, EntradaContato>(contexto.api, "contato.php");
  const id = lerIdDaUrl();

  const campoNome = obterElemento<HTMLInputElement>("contatoNome");
  const campoEmail = obterElemento<HTMLInputElement>("contatoEmail");
  const campoMensagem = obterElemento<HTMLTextAreaElement>("contatoMensagem");
  const campoLida = obterElemento<HTMLInputElement>("contatoLida");
  const botao = obterElemento<HTMLButtonElement>("botaoSalvarContato");

  obterElemento("tituloFormulario").textContent = id === null ? "Nova mensagem" : "Editar mensagem";

  if (id !== null) {
    try {
      const contato = await servico.obter(id);
      campoNome.value = contato.nome;
      campoEmail.value = contato.email;
      campoMensagem.value = contato.mensagem;
      campoLida.checked = contato.lida;
    } catch (erro) {
      mostrarToast(mensagemDeErro(erro), "erro");
      irPara("contatos.html", 1500);
      return;
    }
  }

  obterElemento<HTMLFormElement>("formContato").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const dados: EntradaContato = {
      nome: campoNome.value.trim(),
      email: campoEmail.value.trim().toLowerCase(),
      mensagem: campoMensagem.value.trim(),
      lida: campoLida.checked,
    };

    const erro = erroContato(dados);
    if (erro !== null) {
      mostrarToast(erro, "erro");
      return;
    }

    botao.disabled = true;
    void (async () => {
      try {
        if (id === null) await servico.criar(dados);
        else await servico.editar(id, dados);
        mostrarToast(id === null ? "Mensagem cadastrada com sucesso." : "Mensagem atualizada.");
        irPara("contatos.html", 800);
      } catch (e) {
        mostrarToast(mensagemDeErro(e), "erro");
        botao.disabled = false;
      }
    })();
  });

  obterElemento("botaoCancelarContato").addEventListener("click", () => irPara("contatos.html"));
}

void iniciar();
