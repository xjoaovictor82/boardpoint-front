/* =========================================================================
   BOARD POINT — Admin: template compartilhado da sidebar

   Cada página do admin só declara <div id="sidebarAdmin" data-ativo="produtos">
   vazio no HTML. Este módulo injeta a sidebar completa nesse ponto, com o
   item de menu correto já marcado como ativo — assim o menu inteiro vive
   num único lugar, e adicionar/editar um item aqui atualiza todas as
   páginas de uma vez, sem precisar copiar HTML em cada arquivo.
   ========================================================================= */

const ITENS_MENU_ADMIN = [
  { chave: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
  { chave: 'produtos', label: 'Produtos', href: 'produtos.html' },
  { chave: 'categorias', label: 'Categorias', href: 'categorias.html' },
  { chave: 'pedidos', label: 'Pedidos', href: 'pedidos.html' },
  { chave: 'contatos', label: 'Mensagens', href: 'contatos.html' },
];

function montarSidebarAdmin() {
  const alvo = document.getElementById('sidebarAdmin');
  if (!alvo) return;

  const ativo = alvo.dataset.ativo || '';

  const linksMenu = ITENS_MENU_ADMIN.map((item) => {
    const classeAtiva = item.chave === ativo ? ' class="ativo"' : '';
    return `<a href="${item.href}"${classeAtiva}>${item.label}</a>`;
  }).join('\n      ');

  alvo.outerHTML = `
  <aside class="admin-sidebar">
    <div class="marca">BOARD POINT</div>
    <nav class="admin-nav">
      ${linksMenu}
    </nav>
    <div class="rodape-sidebar">
      <a href="../../index.html" class="link-ver-site" target="_blank" rel="noopener">↗ Ver site</a>
      <div class="usuario-logado">Logado como <strong id="usuarioLogado">—</strong></div>
      <button class="botao-sair" id="botaoSair">Sair</button>
    </div>
  </aside>`;
}

// Roda antes do DOMContentLoaded de comum.js precisar de #botaoSair e
// #usuarioLogado, então chamamos de forma síncrona assim que o script
// carrega (a tag <script> deste arquivo já fica depois do <div id="sidebarAdmin">
// no HTML de cada página, então o elemento já existe no DOM neste ponto).
montarSidebarAdmin();
