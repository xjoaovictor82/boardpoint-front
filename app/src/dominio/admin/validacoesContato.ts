import { validarEmail } from "../utilitarios/validacoesConta";
import type { EntradaContato } from "./tipos";

/** Mesmas regras de contato.php. Devolve a 1ª mensagem de erro ou null. */
export function erroContato(dados: EntradaContato): string | null {
  if (dados.nome === "" || dados.email === "" || dados.mensagem === "") return "Preencha nome, e-mail e mensagem.";
  if (dados.nome.length > 150) return "O nome pode ter no máximo 150 caracteres.";
  if (!validarEmail(dados.email)) return "E-mail inválido. Exemplo: nome@exemplo.com";
  if (dados.mensagem.length > 5000) return "A mensagem pode ter no máximo 5000 caracteres.";
  return null;
}
