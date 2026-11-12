/** Chave do localStorage onde fica o JWT do ADMIN (a mesma usada em paginaLoginAdmin.ts). */
export const CHAVE_TOKEN_ADMIN = "bp_admin_token";
/** Guarda o token do administrador. Fica num só lugar para todas as páginas do painel. */
export class SessaoAdmin {
    get token() {
        try {
            return localStorage.getItem(CHAVE_TOKEN_ADMIN);
        }
        catch {
            return null; // armazenamento bloqueado
        }
    }
    estaLogado() {
        return this.token !== null;
    }
    encerrar() {
        try {
            localStorage.removeItem(CHAVE_TOKEN_ADMIN);
        }
        catch {
            /* sem armazenamento: nada a apagar */
        }
    }
    /** Volta para a tela de login (as páginas ficam em /admin/pages/). */
    irParaLogin() {
        this.encerrar();
        window.location.href = "../login.html";
    }
}
