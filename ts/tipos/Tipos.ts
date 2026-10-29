import type { Produto } from "../entidades/Produto.js";
import type { Categoria } from "../entidades/Categoria.js";

/* Contratos de dados: formatos JSON da API PHP e interfaces usadas entre camadas. */

// --- Aliases ---------------------------------------------------------------
export type Preco = number | null;
export type SlugCategoria = string;
/** "todos" ou o slug de uma categoria. */
export type FiltroCategoria = "todos" | SlugCategoria;
export type Ouvinte = () => void;
export type AoSelecionarProduto = (produto: Produto) => void;
export type StatusPedido = "aguardando_pagamento" | "pago" | "cancelado";
export type CampoDoFormulario = "nome" | "telefone" | "email";

// --- DTOs (o que a API devolve/recebe) --------------------------------------
export interface CategoriaDto {
  id: number;
  slug: SlugCategoria;
  nome: string;
}

export interface ProdutoDto {
  id: number;
  nome: string;
  preco: Preco;
  estoque: number;
  imagem: string;
  ativo: boolean;
  categoria_id: number;
  categoria_slug: SlugCategoria;
  categoria_nome: string;
}

export interface ItemCarrinhoDto {
  produto_id: number;
  nome: string;
  preco: number;
  imagem: string;
  estoque: number;
  quantidade: number;
}

export interface RespostaApi<T> {
  sucesso: boolean;
  erro?: string;
  mensagem?: string;
  dados: T;
}

export interface RespostaProdutos {
  produtos: ProdutoDto[];
  total: number;
}

export interface RespostaPedidoCriado {
  pedido_id: number;
  codigo: string;
  total: number;
  pix_payload: string;
}

export interface DadosCliente {
  nome: string;
  telefone: string;
  email: string;
}

export interface DadosContato {
  nome: string;
  email: string;
  mensagem: string;
}

export interface FiltroProdutos {
  busca: string;
  categoria: FiltroCategoria;
}

// --- Métricas do dashboard ---------------------------------------------------
export interface Destaque {
  nome: string;
  valor: number;
}

export interface LinhaCategoria {
  nome: string;
  total_produtos: number;
}

export interface MetricasDashboard {
  totalProdutos: number;
  totalCategorias: number;
  produtosComPreco: number;
  produtosSemEstoque: number;
  faturamentoPotencial: number;
  precoMedio: number;
  produtosEstoqueCritico: readonly Produto[];
  produtoDestaque: Destaque | null;
  categoriaDestaque: Destaque | null;
  porCategoria: readonly LinhaCategoria[];
}

// --- Contratos entre camadas (interfaces pequenas: princípio I do SOLID) -----
/** Cliente HTTP genérico: devolve só o campo "dados" e lança erro tipado em falha. */
export interface ClienteHttp {
  obter<T>(caminho: string): Promise<T>;
  enviarJson<T>(caminho: string, corpo: unknown): Promise<T>;
  atualizarJson<T>(caminho: string, corpo: unknown): Promise<T>;
}

export interface Armazenamento<T> {
  ler(): T;
  gravar(valor: T): void;
}

export interface ConsultaCategorias {
  listar(): Promise<Categoria[]>;
}

export interface ConsultaProdutosFiltrada {
  buscar(filtro: FiltroProdutos): Promise<Produto[]>;
}

export interface ConsultaProdutosCompleta {
  buscarTodos(): Promise<Produto[]>;
}

/** Uma métrica do dashboard: recebe os produtos e devolve um valor do tipo T. */
export interface Metrica<T> {
  readonly nome: string;
  calcular(produtos: readonly Produto[]): T;
}
