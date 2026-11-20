import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';
import { useToast } from '../../componentes/admin/ToastAdmin';
import { erroContato } from '../../dominio/admin/validacoesContato';
import { ErroBoardPoint } from '../../dominio/excecoes/ErroBoardPoint';
import { servicoContatosAdmin } from '../../infra/servicosAdmin';

/** Cadastro/edição de mensagem de contato (porta de paginaContatoForm.ts + contato-form.html). */
export function PaginaContatoFormAdmin() {
  const { id: idTexto } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const mostrarToast = useToast();

  const id = idTexto !== undefined ? Number(idTexto) : null;
  const ehEdicao = id !== null && Number.isInteger(id) && id > 0;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [lida, setLida] = useState(false);
  const [carregando, setCarregando] = useState(ehEdicao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!ehEdicao) return;
    let ativo = true;
    servicoContatosAdmin
      .obter(id)
      .then((contato) => {
        if (!ativo) return;
        setNome(contato.nome);
        setEmail(contato.email);
        setMensagem(contato.mensagem);
        setLida(contato.lida);
        setCarregando(false);
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        mostrarToast(erro instanceof ErroBoardPoint ? erro.message : 'Erro ao carregar.', 'erro');
        window.setTimeout(() => navegar('/admin/contatos'), 1500);
      });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehEdicao, id]);

  const salvar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    const dados = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      mensagem: mensagem.trim(),
      lida,
    };

    const erro = erroContato(dados);
    if (erro !== null) {
      mostrarToast(erro, 'erro');
      return;
    }

    setSalvando(true);
    try {
      if (!ehEdicao) await servicoContatosAdmin.criar(dados);
      else await servicoContatosAdmin.editar(id, dados);
      mostrarToast(ehEdicao ? 'Mensagem atualizada.' : 'Mensagem cadastrada com sucesso.');
      window.setTimeout(() => navegar('/admin/contatos'), 800);
    } catch (erroCapturado) {
      mostrarToast(erroCapturado instanceof ErroBoardPoint ? erroCapturado.message : 'Erro inesperado.', 'erro');
      setSalvando(false);
    }
  };

  return (
    <LayoutAdmin titulo={ehEdicao ? 'Editar mensagem' : 'Nova mensagem'}>
      <div className="painel">
        <form style={{ maxWidth: 620 }} noValidate onSubmit={(evento) => void salvar(evento)}>
          <div className="campo-grupo">
            <label htmlFor="contatoNome">Nome</label>
            <input
              type="text"
              id="contatoNome"
              className="form-control"
              maxLength={150}
              required
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label htmlFor="contatoEmail">E-mail</label>
            <input
              type="email"
              id="contatoEmail"
              className="form-control"
              maxLength={150}
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label htmlFor="contatoMensagem">Mensagem</label>
            <textarea
              id="contatoMensagem"
              className="form-control"
              rows={5}
              maxLength={5000}
              required
              value={mensagem}
              onChange={(evento) => setMensagem(evento.target.value)}
              disabled={carregando}
            />
          </div>
          <div className="campo-grupo">
            <label>
              <input
                type="checkbox"
                checked={lida}
                onChange={(evento) => setLida(evento.target.checked)}
                disabled={carregando}
              />{' '}
              Marcar como lida
            </label>
          </div>
          <div className="modal-acoes" style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="botao-secundario" onClick={() => navegar('/admin/contatos')}>
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
