import { useState } from 'react';
import type { FormEvent } from 'react';
import { useJanelaModal } from '../../hooks/useJanelaModal';
import { servicoContato } from '../../infra/servicos';

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoEnviar: () => void;
}

/** Janela "Fale conosco". O pai usa `key` para limpar o formulário a cada abertura. */
export function ModalContato({ aberto, aoFechar, aoEnviar }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useJanelaModal(aberto, aoFechar, true);

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await servicoContato.enviar({ nome: nome.trim(), email: email.trim(), mensagem: mensagem.trim() });
      aoEnviar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível enviar sua mensagem. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={aberto ? 'modal-contato aberto' : 'modal-contato'} id="modalContato" aria-hidden={!aberto}>
      <div className="modal-contato__fundo" onClick={aoFechar} />
      <div className="modal-contato__caixa" role="dialog" aria-modal="true" aria-labelledby="tituloModalContato">
        <button type="button" className="modal-contato__fechar" aria-label="Fechar" onClick={aoFechar}>
          ×
        </button>
        <h3 id="tituloModalContato">Fale com a Board Point</h3>
        <p className="modal-contato__legenda">Preencha os campos abaixo e enviaremos sua mensagem por e-mail.</p>

        <form onSubmit={(evento) => void enviar(evento)}>
          <label htmlFor="campoNome">Nome</label>
          <input
            type="text"
            id="campoNome"
            name="nome"
            className="form-control"
            required
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label htmlFor="campoEmailRemetente">Seu e-mail</label>
          <input
            type="email"
            id="campoEmailRemetente"
            name="email"
            className="form-control"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="campoMensagem">Mensagem</label>
          <textarea
            id="campoMensagem"
            name="mensagem"
            className="form-control"
            rows={4}
            required
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />

          {erro && (
            <p className="form-erro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" className="modal-contato__enviar" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar mensagem'}
          </button>
        </form>
      </div>
    </div>
  );
}
