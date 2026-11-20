import type { ClienteHttp } from "../tipos/Tipos";
import { ServicoCrud } from "./ServicoCrud";
import type { EntradaPedido, PedidoAdmin, ResultadoPedido } from "./tipos";

/**
 * CRUD de pedidos do painel (porta de paginaPedidos.ts/paginaPedidoForm.ts).
 * Sem overrides: é o ServicoCrud genérico puro, como no original (a diferença entre
 * criar e editar pedido está só no que o FORMULÁRIO manda, não no serviço).
 */
export class ServicoPedidosAdmin extends ServicoCrud<PedidoAdmin, EntradaPedido, ResultadoPedido> {
  constructor(http: ClienteHttp) {
    super(http, "pedidos.php");
  }
}
