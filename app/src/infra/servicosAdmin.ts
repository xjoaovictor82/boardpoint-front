import { ServicoCategorias } from '../dominio/admin/ServicoCategorias';
import { ServicoContatosAdmin } from '../dominio/admin/ServicoContatosAdmin';
import { ServicoPedidosAdmin } from '../dominio/admin/ServicoPedidosAdmin';
import { ServicoProdutos } from '../dominio/admin/ServicoProdutos';
import { ClienteApi } from '../dominio/repositorios/ClienteApi';
import { CHAVE_TOKEN_ADMIN, SessaoAdmin } from '../dominio/servicos/SessaoAdmin';
import { ServicoAdmin } from '../dominio/servicos/ServicoAdmin';

// Composição do domínio do painel (equivale ao antigo iniciarPaginaAdmin.ts).
// Separado de infra/servicos.ts de propósito: o token e a sessão do admin
// nunca devem se misturar com o token e a sessão do cliente da loja.
export const sessaoAdmin = new SessaoAdmin();

// Se a API responder 401, o token do admin venceu: encerra a sessão e as telas redirecionam sozinhas.
export const apiAdmin = new ClienteApi('/admin/api/', () => sessaoAdmin.encerrar(), CHAVE_TOKEN_ADMIN);

export const servicoAdmin = new ServicoAdmin(apiAdmin, sessaoAdmin);
export const servicoCategorias = new ServicoCategorias(apiAdmin);
export const servicoProdutosAdmin = new ServicoProdutos(apiAdmin);
export const servicoPedidosAdmin = new ServicoPedidosAdmin(apiAdmin);
export const servicoContatosAdmin = new ServicoContatosAdmin(apiAdmin);
