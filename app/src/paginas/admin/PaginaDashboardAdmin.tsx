import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { formatarMoeda } from '../../dominio/utilitarios/formatacao';
import { useMetricasDashboard } from '../../hooks/useMetricasDashboard';

/** Dashboard do painel: métricas calculadas a partir do catálogo de produtos (porta de dashboard.ts). */
export function PaginaDashboardAdmin() {
  const { metricas, carregando, erro } = useMetricasDashboard();

  const cardsBrutos = [
    { rotulo: 'Total de produtos', valor: metricas?.totalProdutos },
    { rotulo: 'Categorias', valor: metricas?.totalCategorias },
    { rotulo: 'Com preço definido', valor: metricas?.produtosComPreco },
    { rotulo: 'Sem estoque', valor: metricas?.produtosSemEstoque },
  ];

  return (
    <LayoutAdmin titulo="Dashboard">
      <div className="grade-stats" id="gradeStats">
        {cardsBrutos.map((card) => (
          <div className="card-stat" key={card.rotulo}>
            <div className="rotulo">{card.rotulo}</div>
            <div className="valor">{card.valor ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Métricas calculadas a partir do array bruto de produtos, não vêm prontas do banco. */}
      <div className="grade-stats" id="gradeStatsCalculadas">
        <div className="card-stat">
          <div className="rotulo">Faturamento potencial (estoque × preço)</div>
          <div className="valor">{metricas ? formatarMoeda(metricas.faturamentoPotencial) : '—'}</div>
        </div>
        <div className="card-stat">
          <div className="rotulo">Preço médio</div>
          <div className="valor">{metricas ? formatarMoeda(metricas.precoMedio) : '—'}</div>
        </div>
        <div className="card-stat">
          <div className="rotulo">Produto com mais estoque</div>
          <div className="valor">
            {metricas?.produtoDestaque
              ? `${metricas.produtoDestaque.nome} (${metricas.produtoDestaque.valor} un.)`
              : metricas
                ? 'Nenhum produto cadastrado'
                : '—'}
          </div>
        </div>
        <div className="card-stat">
          <div className="rotulo">Categoria com mais produtos</div>
          <div className="valor">
            {metricas?.categoriaDestaque
              ? `${metricas.categoriaDestaque.nome} (${metricas.categoriaDestaque.valor} produtos)`
              : metricas
                ? 'Nenhuma categoria cadastrada'
                : '—'}
          </div>
        </div>
      </div>

      <div className="painel">
        <div className="painel-cabecalho">
          <h2>Produtos por categoria</h2>
        </div>
        <table className="tabela-admin table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Produtos cadastrados</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={2} className="estado-vazio">
                  Carregando...
                </td>
              </tr>
            ) : erro || !metricas || metricas.porCategoria.length === 0 ? (
              <tr>
                <td colSpan={2} className="estado-vazio">
                  {erro ? 'Nenhum dado registrado.' : 'Nenhuma categoria cadastrada.'}
                </td>
              </tr>
            ) : (
              metricas.porCategoria.map((categoria) => (
                <tr key={categoria.nome}>
                  <td>{categoria.nome}</td>
                  <td>{categoria.total_produtos}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="painel">
        <div className="painel-cabecalho">
          <h2>Estoque crítico (3 unidades ou menos)</h2>
        </div>
        <ul className="lista-admin">
          {carregando ? (
            <li className="estado-vazio">Carregando...</li>
          ) : erro || !metricas || metricas.produtosEstoqueCritico.length === 0 ? (
            <li className="estado-vazio">
              {erro ? 'Nenhum dado registrado.' : 'Nenhum produto com estoque crítico.'}
            </li>
          ) : (
            metricas.produtosEstoqueCritico.map((produto) => (
              <li key={produto.id}>
                {produto.rotulo} — {produto.estoque} un.
              </li>
            ))
          )}
        </ul>
      </div>
    </LayoutAdmin>
  );
}
