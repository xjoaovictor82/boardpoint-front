import type { ClienteHttp } from "../tipos/Tipos";
import { ServicoCrud } from "./ServicoCrud";
import type { CategoriaAdmin, EntradaCategoria } from "./tipos";

/** CRUD de categorias do painel (porta de paginaCategorias.ts/paginaCategoriaForm.ts). */
export class ServicoCategorias extends ServicoCrud<CategoriaAdmin, EntradaCategoria> {
  constructor(http: ClienteHttp) {
    super(http, "categorias.php");
  }
}
