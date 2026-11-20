import type { ItemCarrinhoDto } from '../dominio/tipos/Tipos';
import { ArmazenamentoLocal } from '../dominio/repositorios/ArmazenamentoLocal';
import { ClienteApi } from '../dominio/repositorios/ClienteApi';
import { RepositorioCategorias } from '../dominio/repositorios/RepositorioCategorias';
import { RepositorioProdutos } from '../dominio/repositorios/RepositorioProdutos';
import { ServicoCarrinho, converterItensSalvos } from '../dominio/servicos/ServicoCarrinho';
import { ServicoConta } from '../dominio/servicos/ServicoConta';
import { SessaoUsuario } from '../dominio/servicos/SessaoUsuario';
import { ServicoContato } from '../dominio/servicos/ServicoContato';
import { ServicoPedido } from '../dominio/servicos/ServicoPedido';

// Composição do domínio (equivale ao antigo main.ts): objetos criados uma única vez.
// Caminho absoluto, porque a SPA roda em qualquer rota (/, /cliente/login, /admin...).
export const api = new ClienteApi('/admin/api/');

export const repositorioCategorias = new RepositorioCategorias(api);
export const repositorioProdutos = new RepositorioProdutos(api);

export const servicoCarrinho = new ServicoCarrinho(
  new ArmazenamentoLocal<ItemCarrinhoDto[]>('bp_carrinho', [], converterItensSalvos),
);

export const servicoPedido = new ServicoPedido(api, servicoCarrinho);
export const servicoContato = new ServicoContato(api);

// Sessão do cliente: uma só para o site inteiro (barra da loja, login, perfil).
export const sessao = new SessaoUsuario();

// Se a API responder 401, o token venceu: encerra a sessão e as telas redirecionam sozinhas.
const apiConta = new ClienteApi('/admin/api/', () => sessao.encerrar());
export const servicoConta = new ServicoConta(apiConta, sessao);
