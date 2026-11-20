import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { useToast } from '../../componentes/admin/ToastAdmin';
import type { CategoriaAdmin } from '../../dominio/admin/tipos';
import { erroProduto, paraEntradaProduto } from '../../dominio/admin/validacoesProduto';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import { urlPublica } from '../../dominio/utilitarios/url';
import { servicoCategorias, servicoProdutosAdmin } from '../../infra/servicosAdmin';

/** Cadastro/edição de produto, com upload de imagem e preview (porta de paginaProdutoForm.ts). */
export function PaginaProdutoFormAdmin() {
  const { id: idTexto } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const mostrarToast = useToast();
  const campoImagem = useRef<HTMLInputElement>(null);

  const id = idTexto !== undefined ? Number(idTexto) : null;
  const ehEdicao = id !== null && Number.isInteger(id) && id > 0;

  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('0');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagemSelecionada, setImagemSelecionada] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(ehEdicao);
  const [salvando, setSalvando] = useState(false);

  // Carrega as categorias (para o <select>) e, se for edição, os dados do produto.
  useEffect(() => {
    let ativo = true;

    const carregarCategorias = servicoCategorias.listarTodos();
    const carregarProduto = ehEdicao ? servicoProdutosAdmin.obter(id) : Promise.resolve(null);

    Promise.all([carregarCategorias, carregarProduto])
      .then(([listaCategorias, produto]) => {
        if (!ativo) return;
        setCategorias(listaCategorias);
        if (produto !== null) {
          setNome(produto.nome);
          setCategoriaId(String(produto.categoria_id));
          setPreco(produto.preco === null ? '' : String(produto.preco));
          setEstoque(String(produto.estoque));
          setPreviewUrl(urlPublica(produto.imagem));
        } else if (listaCategorias[0]) {
          setCategoriaId(String(listaCategorias[0].id));
        }
        setCarregando(false);
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro ao carregar.', 'erro');
        if (ehEdicao) window.setTimeout(() => navegar('/admin/produtos'), 1500);
      });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehEdicao, id]);

  // Libera a URL temporária do preview quando ela é trocada ou o componente desmonta.
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const aoEscolherImagem = (arquivo: File | undefined): void => {
    setImagemSelecionada(arquivo ?? null);
    setPreviewUrl(arquivo ? URL.createObjectURL(arquivo) : null);
  };

  const salvar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    const campos = {
      categoria: categoriaId,
      nome: nome.trim(),
      preco,
      estoque,
      imagem: imagemSelecionada,
    };

    const erro = erroProduto(campos, ehEdicao);
    if (erro !== null) {
      mostrarToast(erro, 'erro');
      return;
    }

    setSalvando(true);
    try {
      const entrada = paraEntradaProduto(campos);
      if (!ehEdicao) await servicoProdutosAdmin.criar(entrada);
      else await servicoProdutosAdmin.editar(id, entrada);
      mostrarToast(ehEdicao ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.');
      window.setTimeout(() => navegar('/admin/produtos'), 800);
    } catch (erroCapturado) {
      mostrarToast(erroCapturado instanceof ErroBoardPoint ? erroCapturado.message : 'Erro inesperado.', 'erro');
      setSalvando(false);
    }
  };

  return (
    <LayoutAdmin titulo={ehEdicao ? 'Editar produto' : 'Novo produto'}>
      <div className="painel">
        <form style={{ maxWidth: 520 }} noValidate onSubmit={(evento) => void salvar(evento)}>
          <div className="campo-grupo">
            <label htmlFor="produtoNome">Nome</label>
            <input
              type="text"
              id="produtoNome"
              className="form-control"
              maxLength={150}
              required
              placeholder="Ex: Tênis Nike — Modelo 3"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label htmlFor="produtoCategoria">Categoria</label>
            <select
              id="produtoCategoria"
              className="form-select"
              required
              value={categoriaId}
              onChange={(evento) => setCategoriaId(evento.target.value)}
              disabled={carregando}
            >
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="campo-grupo">
            <label htmlFor="produtoPreco">Preço (deixe vazio para &quot;Consulte o valor&quot;)</label>
            <input
              type="number"
              id="produtoPreco"
              className="form-control"
              step="0.01"
              min={0}
              placeholder="Ex: 199.90"
              value={preco}
              onChange={(evento) => setPreco(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label htmlFor="produtoEstoque">Estoque</label>
            <input
              type="number"
              id="produtoEstoque"
              className="form-control"
              min={0}
              required
              value={estoque}
              onChange={(evento) => setEstoque(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label htmlFor="produtoImagem">
              Imagem {!ehEdicao && <span id="imagemObrigatoria">(obrigatória)</span>}
            </label>
            <input
              type="file"
              id="produtoImagem"
              className="form-control"
              accept="image/jpeg,image/png,image/webp"
              ref={campoImagem}
              onChange={(evento) => aoEscolherImagem(evento.target.files?.[0])}
              disabled={carregando}
            />
            {previewUrl && <img id="previewImagem" className="preview-imagem ativo" src={previewUrl} alt="Pré-visualização" />}
          </div>
          <div className="modal-acoes" style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="botao-secundario" onClick={() => navegar('/admin/produtos')}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario btn" disabled={carregando || salvando}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </LayoutAdmin>
  );
}
