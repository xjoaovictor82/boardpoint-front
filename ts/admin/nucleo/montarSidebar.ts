interface ItemMenu {
  readonly chave: string;
  readonly rotulo: string;
  readonly href: string;
}

const ITENS_MENU: readonly ItemMenu[] = [
  { chave: "dashboard", rotulo: "Dashboard", href: "dashboard.html" },
  { chave: "produtos", rotulo: "Produtos", href: "produtos.html" },
  { chave: "categorias", rotulo: "Categorias", href: "categorias.html" },
  { chave: "pedidos", rotulo: "Pedidos", href: "pedidos.html" },
  { chave: "contatos", rotulo: "Mensagens", href: "contatos.html" },
];

function criar<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  texto?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

/** Troca <div id="sidebarAdmin" data-ativo="..."> pela barra lateral completa. */
export function montarSidebar(): void {
  const alvo = document.getElementById("sidebarAdmin");
  if (alvo === null) return;
  const ativo = alvo.dataset["ativo"] ?? "";

  const aside = criar("aside", "admin-sidebar");
  aside.appendChild(criar("div", "marca", "BOARD POINT"));

  const nav = criar("nav", "admin-nav");
  for (const item of ITENS_MENU) {
    const link = criar("a", item.chave === ativo ? "ativo" : undefined, item.rotulo);
    link.href = item.href;
    nav.appendChild(link);
  }
  aside.appendChild(nav);

  const rodape = criar("div", "rodape-sidebar");
  const verSite = criar("a", "link-ver-site", "↗ Ver site");
  verSite.href = "../../index.html";
  verSite.target = "_blank";
  verSite.rel = "noopener";

  const usuario = criar("div", "usuario-logado", "Logado como ");
  const nome = criar("strong", undefined, "—");
  nome.id = "usuarioLogado";
  usuario.appendChild(nome);

  const sair = criar("button", "botao-sair", "Sair");
  sair.id = "botaoSair";

  rodape.append(verSite, usuario, sair);
  aside.appendChild(rodape);
  alvo.replaceWith(aside);
}
