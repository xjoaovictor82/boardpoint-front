import { useEffect, useMemo, useState } from 'react';
import type { MetricasDashboard } from '../dominio/tipos/Tipos';
import { RepositorioProdutos } from '../dominio/repositorios/RepositorioProdutos';
import { ServicoMetricas } from '../dominio/servicos/ServicoMetricas';
import {
  CategoriaDestaque,
  EstoqueCritico,
  FaturamentoPotencial,
  PrecoMedio,
  ProdutoDestaque,
  ProdutosComPreco,
  ProdutosPorCategoria,
  ProdutosSemEstoque,
  TotalProdutos,
} from '../dominio/servicos/metricas/Metricas';
import { apiAdmin } from '../infra/servicosAdmin';

// Produtos com estoque até este valor (e maior que zero) entram no alerta de reposição.
const LIMITE_ESTOQUE_CRITICO = 3;

interface Resultado {
  metricas: MetricasDashboard | null;
  carregando: boolean;
  erro: boolean;
}

/**
 * Busca todos os produtos (endpoint público embutido na API do admin) e calcula as
 * métricas do dashboard. Porta de dashboard.ts: aqui só muda o destino do resultado
 * (estado React em vez de PainelDashboard escrevendo direto no DOM).
 */
export function useMetricasDashboard(): Resultado {
  const [estado, setEstado] = useState<{ metricas: MetricasDashboard | null; erro: boolean }>({
    metricas: null,
    erro: false,
  });
  const [carregado, setCarregado] = useState(false);

  // As instâncias não mudam entre renders; cálculo puro a partir do array de produtos.
  const servico = useMemo(
    () =>
      new ServicoMetricas({
        total: new TotalProdutos(),
        comPreco: new ProdutosComPreco(),
        semEstoque: new ProdutosSemEstoque(),
        estoqueCritico: new EstoqueCritico(LIMITE_ESTOQUE_CRITICO),
        faturamento: new FaturamentoPotencial(),
        precoMedio: new PrecoMedio(),
        produtoDestaque: new ProdutoDestaque(),
        categoriaDestaque: new CategoriaDestaque(),
        porCategoria: new ProdutosPorCategoria(),
      }),
    [],
  );

  useEffect(() => {
    let ativo = true;
    const repositorio = new RepositorioProdutos(apiAdmin);

    repositorio
      .buscarTodos()
      .then((produtos) => {
        if (!ativo) return;
        setEstado({ metricas: servico.calcular(produtos), erro: false });
        setCarregado(true);
      })
      .catch(() => {
        // Falha de rede, API fora do ar ou sessão expirada (o cliente já redireciona ao login).
        if (!ativo) return;
        setEstado({ metricas: null, erro: true });
        setCarregado(true);
      });

    return () => {
      ativo = false;
    };
  }, [servico]);

  return { metricas: estado.metricas, carregando: !carregado, erro: estado.erro };
}
