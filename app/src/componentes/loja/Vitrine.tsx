import type { ProdutoDto } from "../../tipos";
import CardProduto from "./CardProduto";

interface Props {
  produtos: ProdutoDto[];
  categoria: string;
  carregando: boolean;
  erro: string | null;
  aoSelecionar?: (produto: ProdutoDto) => void;
}

/** Agrupa por nome de categoria, mantendo a ordem em que os produtos chegam. */
function agruparPorCategoria(produtos: ProdutoDto[]): Map<string, ProdutoDto[]> {
  const mapa = new Map<string, ProdutoDto[]>();
  for (const produto of produtos) {
    const nome = produto.categoria_nome || "Outros";
    const lista = mapa.get(nome);
    if (lista) lista.push(produto);
    else mapa.set(nome, [produto]);
  }
  return mapa;
}

export default function Vitrine({ produtos, categoria, carregando, erro, aoSelecionar }: Props) {
  if (erro !== null) {
    return (
      <div className="grade" aria-busy={carregando}>
        <div className="vazio">
          <strong>Não foi possível carregar os produtos</strong>
          {erro}
        </div>
      </div>
    );
  }

  if (!carregando && produtos.length === 0) {
    return (
      <div className="grade">
        <div className="vazio">
          <strong>Nenhum produto encontrado</strong>
          Tente outro termo de busca ou escolha outra categoria.
        </div>
      </div>
    );
  }

  const grupos: [string, ProdutoDto[]][] =
    categoria === "todos" ? Array.from(agruparPorCategoria(produtos).entries()) : [["", produtos]];

  return (
    <div className="grade" aria-busy={carregando}>
      {grupos.map(([nome, lista]) => (
        <section key={nome || "unico"} className="grade__grupo">
          {nome !== "" && <h3 className="grade__grupo-titulo">{nome}</h3>}
          <div className="grade__linha">
            {lista.map((produto, i) => (
              <CardProduto key={produto.id} produto={produto} indice={i} aoSelecionar={aoSelecionar} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}