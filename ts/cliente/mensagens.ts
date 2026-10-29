import { ErroApi } from "../excecoes/ErroApi.js";
import { ErroRede } from "../excecoes/ErroRede.js";
import { ErroValidacao } from "../excecoes/ErroValidacao.js";

export type ContextoErro = "login" | "cadastro" | "perfil";

/** Transforma qualquer erro da API/rede em uma frase amigável para mostrar na tela. */
export function mensagemAmigavel(erro: unknown, contexto: ContextoErro): string {
  if (erro instanceof ErroRede || erro instanceof ErroValidacao) {
    return erro.message;
  }
  if (erro instanceof ErroApi) {
    switch (erro.status) {
      case 401:
        return contexto === "login"
          ? "E-mail ou senha incorretos. Confira e tente de novo."
          : "Sua sessão expirou. Entre novamente.";
      case 403:
        return "Você não tem permissão para fazer isso.";
      case 404:
        return "Conta não encontrada. Entre novamente.";
      case 409:
      case 422:
        return erro.message; // o servidor já devolve uma frase clara em português
      default:
        if (erro.status >= 500) {
          return "O servidor está com problemas no momento. Tente novamente em instantes.";
        }
        return erro.message;
    }
  }
  return "Algo deu errado. Tente novamente.";
}
