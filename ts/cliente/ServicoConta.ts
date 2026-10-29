import type { ClienteHttp } from "../tipos/Tipos.js";
import { ErroValidacao } from "../excecoes/ErroValidacao.js";
import type { SessaoUsuario } from "./SessaoUsuario.js";
import { errosConta, errosLogin, somenteDigitos, type CamposConta, type ErrosCampos } from "./validacoes.js";

export interface Perfil {
  id: number;
  nome: string;
  email: string;
  cpf: string;
}

interface RespostaLogin {
  token: string;
  nome: string;
}

function primeiroErro(erros: ErrosCampos): string | undefined {
  return Object.values(erros)[0];
}

/** Regras de conta do cliente: entrar, cadastrar, ver e editar o próprio perfil. */
export class ServicoConta {
  readonly #http: ClienteHttp;
  readonly #sessao: SessaoUsuario;

  constructor(http: ClienteHttp, sessao: SessaoUsuario) {
    this.#http = http;
    this.#sessao = sessao;
  }

  async entrar(email: string, senha: string): Promise<void> {
    const erro = primeiroErro(errosLogin(email, senha));
    if (erro) throw new ErroValidacao(erro);

    const resposta = await this.#http.enviarJson<RespostaLogin>("clientes.php?acao=login", { email, senha });
    this.#sessao.iniciar(resposta.token, resposta.nome);
  }

  async cadastrar(campos: CamposConta): Promise<void> {
    const erro = primeiroErro(errosConta(campos, true, true));
    if (erro) throw new ErroValidacao(erro);

    await this.#http.enviarJson<null>("clientes.php?acao=registrar", {
      nome: campos.nome,
      email: campos.email,
      cpf: somenteDigitos(campos.cpf),
      senha: campos.senha,
    });
  }

  obterPerfil(): Promise<Perfil> {
    return this.#http.obter<Perfil>("clientes.php?acao=perfil");
  }

  /** O e-mail é enviado só porque o servidor o exige igual ao cadastrado: ele não pode mudar. */
  async atualizarPerfil(emailAtual: string, campos: CamposConta): Promise<Perfil> {
    const erro = primeiroErro(errosConta(campos, false, false));
    if (erro) throw new ErroValidacao(erro);

    const corpo: Record<string, string> = {
      nome: campos.nome,
      email: emailAtual,
      cpf: somenteDigitos(campos.cpf),
    };
    if (campos.senha !== "") corpo["senha"] = campos.senha;

    const perfil = await this.#http.atualizarJson<Perfil>("clientes.php?acao=perfil", corpo);
    this.#sessao.definirNome(perfil.nome);
    return perfil;
  }

  sair(): void {
    this.#sessao.encerrar();
  }
}