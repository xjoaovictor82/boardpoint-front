/** Formato das listagens paginadas devolvidas por `respostaPaginada()` no PHP. */
export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

/** Categoria como a API administrativa devolve. */
export interface CategoriaAdmin {
  id: number;
  slug: string;
  nome: string;
}

/** Dados enviados ao criar/editar uma categoria. */
export interface EntradaCategoria {
  nome: string;
  slug: string;
}

/** Tipo de aviso mostrado no toast. */
export type TipoToast = "sucesso" | "erro";

// --- Produtos ----------------------------------------------------------------
/** Dados do formulário de produto (já convertidos). `imagem` só é obrigatória no cadastro. */
export interface EntradaProduto {
  categoria_id: number;
  nome: string;
  preco: number | null;
  estoque: number;
  imagem: File | null;
}

export interface ResultadoProduto {
  id: number;
  imagem?: string;
}

// --- Contatos ----------------------------------------------------------------
export interface ContatoAdmin {
  id: number;
  nome: string;
  email: string;
  mensagem: string;
  lida: boolean;
  criado_em: string;
}

export interface EntradaContato {
  nome: string;
  email: string;
  mensagem: string;
  lida: boolean;
}

// --- Pedidos -----------------------------------------------------------------
export type StatusDoPedido = "aguardando_pagamento" | "pago" | "cancelado";

export interface ItemPedidoAdmin {
  produto_id: number;
  produto_nome: string;
  preco_unitario: number;
  quantidade: number;
}

export interface PedidoAdmin {
  id: number;
  codigo: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email: string | null;
  total: number;
  status: StatusDoPedido;
  criado_em: string;
  itens: ItemPedidoAdmin[];
}

export interface ItemEntradaPedido {
  produto_id: number;
  quantidade: number;
}

/** Cadastro: cliente + itens. Edição: qualquer combinação de cliente/status (a API não edita itens). */
export interface EntradaPedido {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email: string;
  status: StatusDoPedido;
  itens: ItemEntradaPedido[];
}

export interface ResultadoPedido {
  id: number;
  codigo?: string;
  total?: number;
  status: StatusDoPedido;
}
