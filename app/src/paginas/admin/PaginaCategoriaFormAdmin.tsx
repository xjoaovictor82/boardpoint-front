import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { useToast } from '../../componentes/admin/ToastAdmin';
import { CampoTexto } from '../../componentes/conta/CampoTexto';
import { erroCategoria, slugificar } from '../../dominio/admin/validacoesCategoria';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import { servicoCategorias } from '../../infra/servicosAdmin';

/** Cadastro/edição de categoria (porta de paginaCategoriaForm.ts + categoria-form.html). */
export function PaginaCategoriaFormAdmin() {
  const { id: idTexto } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const mostrarToast = useToast();

  // undefined = cadastro novo; o parâmetro só existe na rota de edição.
  const id = idTexto !== undefined ? Number(idTexto) : null;
  const ehEdicao = id !== null && Number.isInteger(id) && id > 0;

  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTocado, setSlugTocado] = useState(false);
  const [carregando, setCarregando] = useState(ehEdicao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!ehEdicao) return;
    let ativo = true;
    servicoCategorias
      .obter(id)
      .then((categoria) => {
        if (!ativo) return;
        setNome(categoria.nome);
        setSlug(categoria.slug);
        setCarregando(false);
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro ao carregar.', 'erro');
        window.setTimeout(() => navegar('/admin/categorias'), 1500);
      });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehEdicao, id]);

  // No cadastro, o slug acompanha o nome enquanto a pessoa digita (até ela mexer nele à mão).
  const aoMudarNome = (valor: string): void => {
    setNome(valor);
    if (!ehEdicao && !slugTocado) setSlug(slugificar(valor));
  };

  const salvar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    const dados = { nome: nome.trim(), slug: slug.trim().toLowerCase() };

    const erro = erroCategoria(dados);
    if (erro !== null) {
      mostrarToast(erro, 'erro');
      return;
    }

    setSalvando(true);
    try {
      if (!ehEdicao) await servicoCategorias.criar(dados);
      else await servicoCategorias.editar(id, dados);
      mostrarToast(ehEdicao ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.');
      window.setTimeout(() => navegar('/admin/categorias'), 800);
    } catch (erroCapturado) {
      mostrarToast(erroCapturado instanceof ErroBoardPoint ? erroCapturado.message : 'Erro inesperado.', 'erro');
      setSalvando(false);
    }
  };

  return (
    <LayoutAdmin titulo={ehEdicao ? 'Editar categoria' : 'Nova categoria'}>
      <div className="painel">
        <form style={{ maxWidth: 520 }} noValidate onSubmit={(evento) => void salvar(evento)}>
          <CampoTexto
            nome="categoria-nome"
            rotulo="Nome"
            maxLength={100}
            placeholder="Ex: Bonés"
            valor={nome}
            aoMudar={aoMudarNome}
            disabled={carregando}
          />
          <CampoTexto
            nome="categoria-slug"
            rotulo="Slug (identificador, sem espaços)"
            maxLength={60}
            placeholder="Ex: bones"
            valor={slug}
            aoMudar={(valor) => {
              setSlug(valor);
              setSlugTocado(true);
            }}
            disabled={carregando}
          />
          <div className="modal-acoes" style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => navegar('/admin/categorias')}
            >
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
