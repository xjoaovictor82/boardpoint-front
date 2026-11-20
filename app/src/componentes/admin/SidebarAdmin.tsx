import { NavLink } from 'react-router-dom';
import { useSessaoAdmin } from '../../hooks/useSessaoAdmin';
import { servicoAdmin } from '../../infra/servicosAdmin';

interface ItemMenu {
  readonly rotulo: string;
  readonly caminho: string;
}

const ITENS_MENU: readonly ItemMenu[] = [
  { rotulo: 'Dashboard', caminho: '/admin' },
  { rotulo: 'Produtos', caminho: '/admin/produtos' },
  { rotulo: 'Categorias', caminho: '/admin/categorias' },
  { rotulo: 'Pedidos', caminho: '/admin/pedidos' },
  { rotulo: 'Mensagens', caminho: '/admin/contatos' },
];

/** Barra lateral do painel: marca, menu e rodapé com usuário logado + sair (porta de montarSidebar.ts). */
export function SidebarAdmin() {
  const { nome } = useSessaoAdmin();

  return (
    <aside className="admin-sidebar">
      <div className="marca">BOARD POINT</div>

      <nav className="admin-nav">
        {ITENS_MENU.map((item) => (
          <NavLink key={item.caminho} to={item.caminho} end={item.caminho === '/admin'}>
            {item.rotulo}
          </NavLink>
        ))}
      </nav>

      <div className="rodape-sidebar">
        <a className="link-ver-site" href="/" target="_blank" rel="noopener noreferrer">
          ↗ Ver site
        </a>
        <div className="usuario-logado">
          Logado como <strong>{nome || '—'}</strong>
        </div>
        <button type="button" className="botao-sair" onClick={() => servicoAdmin.sair()}>
          Sair
        </button>
      </div>
    </aside>
  );
}
