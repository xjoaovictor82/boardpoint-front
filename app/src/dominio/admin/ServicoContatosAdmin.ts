import type { ClienteHttp } from "../tipos/Tipos";
import { ServicoCrud } from "./ServicoCrud";
import type { ContatoAdmin, EntradaContato } from "./tipos";

/** CRUD das mensagens de contato do painel (porta de paginaContatos.ts/paginaContatoForm.ts). */
export class ServicoContatosAdmin extends ServicoCrud<ContatoAdmin, EntradaContato> {
  constructor(http: ClienteHttp) {
    super(http, "contato.php");
  }
}
