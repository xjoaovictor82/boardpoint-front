/* =========================================================================
   BOARD POINT — dashboard.ts (painel admin)
   Ponto de entrada do dashboard: busca os produtos pela API e delega o cálculo
   às métricas (servicos/metricas/) e a exibição ao PainelDashboard.
   Compilado para js/dashboard.js com `tsc -p ts`.
   ========================================================================= */
import { iniciarPaginaAdmin } from "./admin/nucleo/iniciarPaginaAdmin.js";
import { RepositorioProdutos } from "./repositorios/RepositorioProdutos.js";
import { ServicoMetricas } from "./servicos/ServicoMetricas.js";
import { CategoriaDestaque, EstoqueCritico, FaturamentoPotencial, PrecoMedio, ProdutoDestaque, ProdutosComPreco, ProdutosPorCategoria, ProdutosSemEstoque, TotalProdutos, } from "./servicos/metricas/Metricas.js";
import { PainelDashboard } from "./ui/PainelDashboard.js";
// Produtos com estoque até este valor (e maior que zero) entram no alerta de reposição.
const LIMITE_ESTOQUE_CRITICO = 3;
async function iniciar() {
    // Monta a sidebar, exige login e devolve o cliente da API com o token do admin.
    const contexto = await iniciarPaginaAdmin();
    if (contexto === null)
        return;
    const repositorio = new RepositorioProdutos(contexto.api);
    const servico = new ServicoMetricas({
        total: new TotalProdutos(),
        comPreco: new ProdutosComPreco(),
        semEstoque: new ProdutosSemEstoque(),
        estoqueCritico: new EstoqueCritico(LIMITE_ESTOQUE_CRITICO),
        faturamento: new FaturamentoPotencial(),
        precoMedio: new PrecoMedio(),
        produtoDestaque: new ProdutoDestaque(),
        categoriaDestaque: new CategoriaDestaque(),
        porCategoria: new ProdutosPorCategoria(),
    });
    const painel = new PainelDashboard();
    try {
        painel.exibir(servico.calcular(await repositorio.buscarTodos()));
    }
    catch {
        // Falha de rede, API fora do ar ou sessão expirada (o cliente já redireciona ao login).
        painel.exibirVazio();
    }
}
void iniciar();
