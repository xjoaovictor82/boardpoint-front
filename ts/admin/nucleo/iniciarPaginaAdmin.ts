import { ClienteApi } from "../../repositorios/ClienteApi.js";
import { ErroBoardPoint } from "../../excecoes/ErroBoardPoint.js";
import { CHAVE_TOKEN_ADMIN, SessaoAdmin } from "./SessaoAdmin.js";
import { montarSidebar } from "./montarSidebar.js";

interface RespostaStatus {
  autenticado: boolean;
  usuario?: string;
}

export interface ContextoAdmin {
  readonly api: ClienteApi;
  readonly sessao: SessaoAdmin;
}

/**
 * Preparação comum de toda página interna do painel: monta a sidebar, exige login,
 * confere o token no servidor e liga o botão "Sair". Devolve o cliente da API já
 * configurado com o token do admin. Se não estiver logado, redireciona e devolve null.
 */
export async function iniciarPaginaAdmin(): Promise<ContextoAdmin | null> {
  const sessao = new SessaoAdmin();
  montarSidebar();

  if (!sessao.estaLogado()) {
    sessao.irParaLogin();
    return null;
  }

  // Página em /admin/pages/ -> API em /admin/api/
  const api = new ClienteApi("../api/", () => sessao.irParaLogin(), CHAVE_TOKEN_ADMIN);

  try {
    const status = await api.obter<RespostaStatus>("auth.php?acao=status");
    const nome = document.getElementById("usuarioLogado");
    if (nome !== null) nome.textContent = status.usuario ?? "";
  } catch (erro) {
    if (erro instanceof ErroBoardPoint) {
      sessao.irParaLogin();
      return null;
    }
    throw erro;
  }

  document.getElementById("botaoSair")?.addEventListener("click", () => {
    void api.enviarJson<null>("auth.php?acao=logout", {}).catch(() => undefined).finally(() => sessao.irParaLogin());
  });

  return { api, sessao };
}
