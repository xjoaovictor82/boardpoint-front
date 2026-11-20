import type { ClienteHttp } from "../tipos/Tipos";
import { ErroBoardPoint } from "../excecoes/ErroBoardPoint";
import { ErroValidacao } from "../excecoes/ErroValidacao";
import { errosLogin, type ErrosCampos } from "../utilitarios/validacoesConta";
import type { SessaoAdmin } from "./SessaoAdmin";

interface RespostaLoginAdmin {
  token: string;
  usuario: string;
}

interface RespostaStatus {
  autenticado: boolean;
  usuario?: string;
}

function primeiroErro(erros: ErrosCampos): string | undefined {
  return Object.values(erros)[0];
}

/** Regras de acesso ao painel: entrar, confirmar a sessão no servidor e sair. */
export class ServicoAdmin {
  readonly #http: ClienteHttp;
  readonly #sessao: SessaoAdmin;

  constructor(http: ClienteHttp, sessao: SessaoAdmin) {
    this.#http = http;
    this.#sessao = sessao;
  }

  async entrar(email: string, senha: string): Promise<void> {
    const erro = primeiroErro(errosLogin(email, senha));
    if (erro) throw new ErroValidacao(erro);

    const resposta = await this.#http.enviarJson<RespostaLoginAdmin>("auth.php?acao=login", { email, senha });
    this.#sessao.iniciar(resposta.token, resposta.usuario);
  }

  /** Confirma no servidor que o token salvo ainda vale e atualiza o nome exibido na sidebar. */
  async confirmarSessao(): Promise<void> {
    try {
      const status = await this.#http.obter<RespostaStatus>("auth.php?acao=status");
      this.#sessao.definirNome(status.usuario ?? "");
    } catch (erro) {
      this.#sessao.encerrar();
      if (erro instanceof ErroBoardPoint) return;
      throw erro;
    }
  }

  sair(): void {
    void this.#http.enviarJson<null>("auth.php?acao=logout", {}).catch(() => undefined);
    this.#sessao.encerrar();
  }
}
