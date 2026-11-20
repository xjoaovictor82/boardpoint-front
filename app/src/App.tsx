import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PaginaEmConstrucao } from './componentes/PaginaEmConstrucao';
import { ProvedorToastAdmin } from './componentes/admin/ToastAdmin';
import { RotaProtegidaAdmin } from './componentes/admin/RotaProtegidaAdmin';
import { PaginaCategoriaFormAdmin } from './paginas/admin/PaginaCategoriaFormAdmin';
import { PaginaCategoriasAdmin } from './paginas/admin/PaginaCategoriasAdmin';
import { PaginaContatoFormAdmin } from './paginas/admin/PaginaContatoFormAdmin';
import { PaginaContatosAdmin } from './paginas/admin/PaginaContatosAdmin';
import { PaginaDashboardAdmin } from './paginas/admin/PaginaDashboardAdmin';
import { PaginaLoginAdmin } from './paginas/admin/PaginaLoginAdmin';
import { PaginaPedidoFormAdmin } from './paginas/admin/PaginaPedidoFormAdmin';
import { PaginaPedidosAdmin } from './paginas/admin/PaginaPedidosAdmin';
import { PaginaProdutoFormAdmin } from './paginas/admin/PaginaProdutoFormAdmin';
import { PaginaProdutosAdmin } from './paginas/admin/PaginaProdutosAdmin';
import { PaginaCadastro } from './paginas/PaginaCadastro';
import { PaginaLoja } from './paginas/PaginaLoja';
import { PaginaLogin } from './paginas/PaginaLogin';
import { PaginaPerfil } from './paginas/PaginaPerfil';

// Toda página interna do painel passa por aqui: exige login e dá acesso ao toast global.
function paginaAdmin(filho: ReactNode): ReactNode {
  return (
    <ProvedorToastAdmin>
      <RotaProtegidaAdmin>{filho}</RotaProtegidaAdmin>
    </ProvedorToastAdmin>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaLoja />} />
      <Route path="/cliente/login" element={<PaginaLogin />} />
      <Route path="/cliente/cadastro" element={<PaginaCadastro />} />
      <Route path="/cliente/perfil" element={<PaginaPerfil />} />

      <Route path="/admin/login" element={<PaginaLoginAdmin />} />
      {/* Todas as telas internas do painel, atrás do login e dentro do toast do admin
          (etapa 3 completa: dashboard, categorias, produtos, pedidos e contatos). */}
      <Route path="/admin" element={paginaAdmin(<PaginaDashboardAdmin />)} />
      <Route path="/admin/categorias" element={paginaAdmin(<PaginaCategoriasAdmin />)} />
      <Route path="/admin/categorias/novo" element={paginaAdmin(<PaginaCategoriaFormAdmin />)} />
      <Route path="/admin/categorias/:id/editar" element={paginaAdmin(<PaginaCategoriaFormAdmin />)} />
      <Route path="/admin/produtos" element={paginaAdmin(<PaginaProdutosAdmin />)} />
      <Route path="/admin/produtos/novo" element={paginaAdmin(<PaginaProdutoFormAdmin />)} />
      <Route path="/admin/produtos/:id/editar" element={paginaAdmin(<PaginaProdutoFormAdmin />)} />
      <Route path="/admin/pedidos" element={paginaAdmin(<PaginaPedidosAdmin />)} />
      <Route path="/admin/pedidos/novo" element={paginaAdmin(<PaginaPedidoFormAdmin />)} />
      <Route path="/admin/pedidos/:id/editar" element={paginaAdmin(<PaginaPedidoFormAdmin />)} />
      <Route path="/admin/contatos" element={paginaAdmin(<PaginaContatosAdmin />)} />
      <Route path="/admin/contatos/novo" element={paginaAdmin(<PaginaContatoFormAdmin />)} />
      <Route path="/admin/contatos/:id/editar" element={paginaAdmin(<PaginaContatoFormAdmin />)} />
      <Route path="*" element={<PaginaEmConstrucao titulo="Página não encontrada" />} />
    </Routes>
  );
}
