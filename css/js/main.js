/* =========================================================================
   BOARD POINT — main.ts (site público)
   Ponto de entrada: só cria os objetos e liga uns aos outros ("composição").
   Toda a lógica está nas camadas entidades/, repositorios/, servicos/ e ui/.
   Compilado para js/main.js com `tsc -p ts` (ver LEIA-ME.md).
   ========================================================================= */
import { ArmazenamentoLocal } from "./repositorios/ArmazenamentoLocal.js";
import { ClienteApi } from "./repositorios/ClienteApi.js";
import { RepositorioCategorias } from "./repositorios/RepositorioCategorias.js";
import { RepositorioProdutos } from "./repositorios/RepositorioProdutos.js";
import { ServicoCarrinho, converterItensSalvos } from "./servicos/ServicoCarrinho.js";
import { ServicoContato } from "./servicos/ServicoContato.js";
import { ServicoPedido } from "./servicos/ServicoPedido.js";
import { AvisoCarrinho } from "./ui/AvisoCarrinho.js";
import { ContadorCarrinho } from "./ui/ContadorCarrinho.js";
import { ControladorLoja } from "./ui/ControladorLoja.js";
import { Lightbox } from "./ui/Lightbox.js";
import { ModalCarrinho } from "./ui/ModalCarrinho.js";
import { ModalCheckout } from "./ui/ModalCheckout.js";
import { ModalContato } from "./ui/ModalContato.js";
import { VideoHero } from "./ui/VideoHero.js";
import { VitrineProdutos } from "./ui/VitrineProdutos.js";
import { obterElemento } from "./utilitarios/dom.js";
function iniciar() {
    // Infraestrutura
    const api = new ClienteApi("admin/api/");
    const armazenamento = new ArmazenamentoLocal("bp_carrinho", [], converterItensSalvos);
    // Serviços
    const carrinho = new ServicoCarrinho(armazenamento);
    const pedidos = new ServicoPedido(api, carrinho);
    const contato = new ServicoContato(api);
    // Interface
    const aviso = new AvisoCarrinho();
    new ContadorCarrinho(carrinho);
    const checkout = new ModalCheckout(pedidos);
    new ModalCarrinho(carrinho, () => checkout.abrir());
    new ModalContato(contato);
    const lightbox = new Lightbox((produto, quantidade) => {
        carrinho.adicionar(produto, quantidade);
        lightbox.fechar();
        aviso.mostrar();
    });
    const vitrine = new VitrineProdutos((produto) => {
        lightbox.exibir(produto);
        lightbox.abrir();
    });
    new VideoHero(document.querySelector(".hero__video"));
    obterElemento("ano").textContent = String(new Date().getFullYear());
    const loja = new ControladorLoja(new RepositorioCategorias(api), new RepositorioProdutos(api), vitrine);
    void loja.iniciar();
}
iniciar();
