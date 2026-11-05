import { ClienteApi } from "../repositorios/ClienteApi.js";
import { obterElemento } from "../utilitarios/dom.js";
import { comBotaoOcupado, definirErroCampo, esconderAlerta, limparErroAoDigitar, mostrarAlerta, mostrarErrosCampos } from "./formulario.js";
import { mensagemAmigavel } from "./mensagens.js";
import { ServicoConta } from "./ServicoConta.js";
import { sessao } from "./SessaoUsuario.js";
import { errosConta, formatarCpf, validarCpf } from "./validacoes.js";
const CAMPOS = ["nome", "email", "cpf", "senha", "confirmarSenha"];
function valor(campo) {
    return obterElemento(`campo-${campo}`).value;
}
function iniciar() {
    if (sessao.estaLogado()) {
        window.location.replace("../index.html");
        return;
    }
<<<<<<< HEAD
    const api = new ClienteApi("../admin/api/");
    const servico = new ServicoConta(api, sessao);
    const formulario = obterElemento("formCadastro");
    const botao = obterElemento("botaoCadastrar");
    const campoCpf = obterElemento("campo-cpf");
  const botaoSugerir = obterElemento("botaoSugerirSenha");
  const campoSenha = obterElemento("campo-senha");
  const campoConfirmar = obterElemento("campo-confirmarSenha");
=======
    const servico = new ServicoConta(new ClienteApi("../admin/api/"), sessao);
    const formulario = obterElemento("formCadastro");
    const botao = obterElemento("botaoCadastrar");
    const campoCpf = obterElemento("campo-cpf");
>>>>>>> ddce26904b425819d8fa0e0f0e7b2d1de7b7a08b
    limparErroAoDigitar(CAMPOS);
    campoCpf.addEventListener("input", () => {
        campoCpf.value = formatarCpf(campoCpf.value);
    });
    // Valida o CPF assim que a pessoa sai do campo (campo vazio só reclama ao enviar).
    campoCpf.addEventListener("blur", () => {
        if (campoCpf.value.trim() === "")
            return;
        definirErroCampo("cpf", validarCpf(campoCpf.value) ? "" : "CPF inválido. Confira os números.");
    });
<<<<<<< HEAD
  botaoSugerir.addEventListener("click", () => {
    esconderAlerta();
    void comBotaoOcupado(botaoSugerir, "Gerando...", async () => {
      try {
        const { senha } = await api.enviarJson("clientes.php?acao=sugerir-senha", {});
        // Mostra a senha para a pessoa guardar antes de criar a conta.
        campoSenha.type = "text";
        campoConfirmar.type = "text";
        campoSenha.value = senha;
        campoConfirmar.value = senha;
        definirErroCampo("senha", "");
        definirErroCampo("confirmarSenha", "");
        mostrarAlerta("Senha sugerida preenchida. Guarde-a em um lugar seguro antes de criar a conta.", "sucesso");
      } catch (erro) {
        mostrarAlerta(mensagemAmigavel(erro, "cadastro"), "erro");
      }
    });
  });

=======
>>>>>>> ddce26904b425819d8fa0e0f0e7b2d1de7b7a08b
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        esconderAlerta();
        const campos = {
            nome: valor("nome").trim(),
            email: valor("email").trim().toLowerCase(),
            cpf: valor("cpf"),
            senha: valor("senha"),
            confirmarSenha: valor("confirmarSenha"),
        };
        const erros = errosConta(campos, true, true);
        mostrarErrosCampos(CAMPOS, erros);
        if (Object.keys(erros).length > 0)
            return;
        void comBotaoOcupado(botao, "Criando conta...", async () => {
            try {
                await servico.cadastrar(campos);
                // Depois do cadastro, vai para o login (a pessoa entra com a conta que acabou de criar).
                window.location.href = "login.html?cadastro=ok";
            }
            catch (erro) {
                mostrarAlerta(mensagemAmigavel(erro, "cadastro"), "erro");
            }
        });
    });
}
iniciar();
