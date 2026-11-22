/**
 * Botão "olho" para mostrar/ocultar a senha digitada.
 * `ativarOlhosDeSenha()` coloca o botão em todos os campos de senha da página.
 */

const SVG_ABRE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

const ICONE_OLHO = `${SVG_ABRE}<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

const ICONE_OLHO_RISCADO = `${SVG_ABRE}<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function atualizarBotao(botao: HTMLButtonElement, visivel: boolean): void {
  const texto = visivel ? "Ocultar senha" : "Mostrar senha";
  botao.innerHTML = visivel ? ICONE_OLHO_RISCADO : ICONE_OLHO;
  botao.setAttribute("aria-pressed", String(visivel));
  botao.setAttribute("aria-label", texto);
  botao.title = texto;
}

/** Mostra ou esconde a senha de um campo e mantém o ícone do olho em sincronia. */
export function mostrarSenha(entrada: HTMLInputElement, visivel: boolean): void {
  entrada.type = visivel ? "text" : "password";
  const botao = entrada.parentElement?.querySelector<HTMLButtonElement>(".campo__olho");
  if (botao) atualizarBotao(botao, visivel);
}

/** Adiciona o olho em todo `<input type="password">` com a classe `campo__entrada`. */
export function ativarOlhosDeSenha(): void {
  const campos = document.querySelectorAll<HTMLInputElement>('input.campo__entrada[type="password"]');
  campos.forEach((entrada) => {
    const envoltorio = document.createElement("div");
    envoltorio.className = "campo__senha";

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "campo__olho";
    atualizarBotao(botao, false);
    botao.addEventListener("click", () => mostrarSenha(entrada, entrada.type === "password"));

    entrada.replaceWith(envoltorio);
    envoltorio.append(entrada, botao);
  });
}
