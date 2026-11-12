import type { TipoToast } from "./tipos.js";

const ID_TOAST = "toastGlobal";
let temporizador: number | undefined;

/** Aviso rápido no canto da tela (usa as classes .toast do admin.css). */
export function mostrarToast(mensagem: string, tipo: TipoToast = "sucesso"): void {
  let toast = document.getElementById(ID_TOAST);
  if (toast === null) {
    toast = document.createElement("div");
    toast.id = ID_TOAST;
    document.body.appendChild(toast);
  }
  toast.textContent = mensagem;
  toast.className = tipo === "erro" ? "toast mostrar erro" : "toast mostrar";

  window.clearTimeout(temporizador);
  temporizador = window.setTimeout(() => toast.classList.remove("mostrar"), 3200);
}
