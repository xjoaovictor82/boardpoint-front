// Mapa de telas do projeto. Cada rota substitui um .html do front antigo
// e será trocada pelo componente real conforme a migração avança.
export interface DefinicaoRota {
  caminho: string;
  titulo: string;
  etapa: 'loja' | 'admin';
}

export const rotas: readonly DefinicaoRota[] = [
  { caminho: '/', titulo: 'Loja', etapa: 'loja' },
  { caminho: '/cliente/login', titulo: 'Login do cliente', etapa: 'loja' },
  { caminho: '/cliente/cadastro', titulo: 'Cadastro do cliente', etapa: 'loja' },
  { caminho: '/cliente/perfil', titulo: 'Perfil do cliente', etapa: 'loja' },
  { caminho: '/admin/login', titulo: 'Login do painel', etapa: 'admin' },
  { caminho: '/admin', titulo: 'Dashboard', etapa: 'admin' },
  { caminho: '/admin/categorias', titulo: 'Categorias', etapa: 'admin' },
  { caminho: '/admin/categorias/novo', titulo: 'Nova categoria', etapa: 'admin' },
  { caminho: '/admin/categorias/:id/editar', titulo: 'Editar categoria', etapa: 'admin' },
  { caminho: '/admin/produtos', titulo: 'Produtos', etapa: 'admin' },
  { caminho: '/admin/produtos/novo', titulo: 'Novo produto', etapa: 'admin' },
  { caminho: '/admin/produtos/:id/editar', titulo: 'Editar produto', etapa: 'admin' },
  { caminho: '/admin/pedidos', titulo: 'Pedidos', etapa: 'admin' },
  { caminho: '/admin/pedidos/novo', titulo: 'Novo pedido', etapa: 'admin' },
  { caminho: '/admin/pedidos/:id/editar', titulo: 'Editar pedido', etapa: 'admin' },
  { caminho: '/admin/contatos', titulo: 'Mensagens', etapa: 'admin' },
  { caminho: '/admin/contatos/novo', titulo: 'Nova mensagem', etapa: 'admin' },
  { caminho: '/admin/contatos/:id/editar', titulo: 'Editar mensagem', etapa: 'admin' },
];
