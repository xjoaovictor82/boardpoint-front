import type { Produto } from '../../dominio/entidades/Produto';
import type { FiltroCategoria } from '../../dominio/tipos/Tipos';
import { CarrosselProdutos } from './CarrosselProdutos';

interface Props {
  produtos: readonly Produto[];
  categoria: FiltroCategoria;
  carregando: boolean;
  carregado: boolean;
  erro: string | null;
  aoSelecionar: (produto: Produto) => void;
}

/** Agrupa os produtos por categoria, na ordem em que chegam. */
function agruparPorCategoria(produtos: readonly Produto[]): Map<string, Produto[]> {
  const grupos = new Map<string, Produto[]>();
  produtos.forEach((produto) => {
    const lista = grupos.get(produto.rotuloCategoria) ?? [];
    lista.push(produto);
    grupos.set(produto.rotuloCategoria, lista);
  });
  return grupos;
}

/** Grade de produtos (um carrossel por categoria). Não busca dados: só exibe. */
export function VitrineProdutos({ produtos, categoria, carregando, carregado, erro, aoSelecionar }: Props) {
  return (
    <div className="grade" id="grade" aria-busy={carregando || undefined}>
      <Conteudo
        produtos={produtos}
        categoria={categoria}
        carregado={carregado}
        erro={erro}
        aoSelecionar={aoSelecionar}
      />
    </div>
  );
}

function Conteudo({ produtos, categoria, carregado, erro, aoSelecionar }: Omit<Props, 'carregando'>) {
  if (erro !== null) {
    return (
      <div className="vazio">
        <strong>Não foi possível carregar os produtos</strong>
        {erro}
      </div>
    );
  }
  if (!carregado) return null;

  if (produtos.length === 0) {
    return (
      <div className="vazio">
        <strong>Nenhum produto encontrado</strong>
        Tente outro termo de busca ou escolha outra categoria.
      </div>
    );
  }

  // Com filtro ativo mantém o carrossel, sem título de grupo.
  if (categoria !== 'todos') {
    return <CarrosselProdutos key={categoria} produtos={produtos} indiceInicial={0} aoSelecionar={aoSelecionar} />;
  }

  let indiceGlobal = 0;
  return (
    <>
      {[...agruparPorCategoria(produtos)].map(([nome, doGrupo]) => {
        const indiceInicial = indiceGlobal;
        indiceGlobal += doGrupo.length;
        return (
          <CarrosselProdutos
            key={nome}
            titulo={nome}
            produtos={doGrupo}
            indiceInicial={indiceInicial}
            aoSelecionar={aoSelecionar}
          />
        );
      })}
    </>
  );
}
