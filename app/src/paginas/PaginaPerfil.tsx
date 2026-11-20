import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { ErroNaoAutenticado } from '../dominio/excecoes/ErroNaoAutenticado';
import type { Perfil } from '../dominio/servicos/ServicoConta';
import { mensagemAmigavel } from '../dominio/utilitarios/mensagensErro';
import { errosConta, formatarCpf } from '../dominio/utilitarios/validacoesConta';
import type { CamposConta } from '../dominio/utilitarios/validacoesConta';
import { AlertaConta } from '../componentes/conta/AlertaConta';
import type { DadosAlerta } from '../componentes/conta/AlertaConta';
import { CampoSenha } from '../componentes/conta/CampoSenha';
import { CampoTexto } from '../componentes/conta/CampoTexto';
import { LayoutAuth } from '../componentes/conta/LayoutAuth';
import { useAlternar } from '../hooks/useAlternar';
import { useErrosCampos } from '../hooks/useErrosCampos';
import { useSessao } from '../hooks/useSessao';
import { servicoConta } from '../infra/servicos';

type Carga = { tipo: 'carregando' } | { tipo: 'ok'; perfil: Perfil } | { tipo: 'erro'; mensagem: string };

/** Rota protegida: sem login, volta para a tela de entrada. */
export function PaginaPerfil() {
  const { logado } = useSessao();
  const [carga, setCarga] = useState<Carga>({ tipo: 'carregando' });
  const [saiu, setSaiu] = useState(false);

  useEffect(() => {
    if (!logado) return;
    let ativo = true;
    servicoConta
      .obterPerfil()
      .then((perfil) => {
        if (ativo) setCarga({ tipo: 'ok', perfil });
      })
      .catch((erro: unknown) => {
        // 401: a sessão já foi encerrada e o redirecionamento abaixo cuida do resto.
        if (!ativo || erro instanceof ErroNaoAutenticado) return;
        setCarga({ tipo: 'erro', mensagem: mensagemAmigavel(erro, 'perfil') });
      });
    return () => {
      ativo = false;
    };
  }, [logado]);

  if (saiu) return <Navigate to="/" replace />;
  if (!logado) return <Navigate to="/cliente/login?expirou=1" replace />;

  const sair = (): void => {
    setSaiu(true);
    servicoConta.sair();
  };

  return (
    <LayoutAuth tituloAba="Meu perfil — Board Point" titulo="Meu perfil" subtitulo="Veja e edite os dados da sua conta.">
      {carga.tipo === 'erro' && <AlertaConta alerta={{ texto: carga.mensagem, tipo: 'erro' }} />}
      {carga.tipo === 'ok' && <FormularioPerfil perfilInicial={carga.perfil} aoSair={sair} />}
    </LayoutAuth>
  );
}

interface PropsFormulario {
  perfilInicial: Perfil;
  aoSair: () => void;
}

function FormularioPerfil({ perfilInicial, aoSair }: PropsFormulario) {
  const [perfil, setPerfil] = useState(perfilInicial);
  const [nome, setNome] = useState(perfilInicial.nome);
  const [cpf, setCpf] = useState(formatarCpf(perfilInicial.cpf));
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [verSenha, alternarSenha] = useAlternar();
  const [verConfirmar, alternarConfirmar] = useAlternar();
  const [alerta, setAlerta] = useState<DadosAlerta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { erros, substituir, limpar } = useErrosCampos();

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    setAlerta(null);

    const campos: CamposConta = { nome: nome.trim(), email: perfil.email, cpf, senha, confirmarSenha };
    const encontrados = errosConta(campos, false, false);
    substituir(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const atualizado = await servicoConta.atualizarPerfil(perfil.email, campos);
      setPerfil(atualizado);
      setNome(atualizado.nome);
      setCpf(formatarCpf(atualizado.cpf));
      setSenha('');
      setConfirmarSenha('');
      setAlerta({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
    } catch (erro) {
      if (erro instanceof ErroNaoAutenticado) return; // a página redireciona para o login
      setAlerta({ texto: mensagemAmigavel(erro, 'perfil'), tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <AlertaConta alerta={alerta} />
      <form id="formPerfil" noValidate onSubmit={(evento) => void enviar(evento)}>
        <CampoTexto
          nome="nome"
          rotulo="Nome completo"
          type="text"
          autoComplete="name"
          maxLength={150}
          valor={nome}
          aoMudar={(valor) => {
            setNome(valor);
            limpar('nome');
          }}
          erro={erros['nome']}
        />
        <CampoTexto
          nome="email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          disabled
          valor={perfil.email}
          aoMudar={() => undefined}
          dica="O e-mail não pode ser alterado."
        />
        <CampoTexto
          nome="cpf"
          rotulo="CPF"
          type="text"
          autoComplete="off"
          inputMode="numeric"
          maxLength={14}
          valor={cpf}
          aoMudar={(valor) => {
            setCpf(formatarCpf(valor));
            limpar('cpf');
          }}
          erro={erros['cpf']}
        />
        <CampoSenha
          nome="senha"
          rotulo="Nova senha (opcional)"
          autoComplete="new-password"
          placeholder="Deixe em branco para manter a atual"
          valor={senha}
          aoMudar={(valor) => {
            setSenha(valor);
            limpar('senha');
          }}
          visivel={verSenha}
          aoAlternar={alternarSenha}
          erro={erros['senha']}
        />
        <CampoSenha
          nome="confirmarSenha"
          rotulo="Confirme a nova senha"
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          valor={confirmarSenha}
          aoMudar={(valor) => {
            setConfirmarSenha(valor);
            limpar('confirmarSenha');
          }}
          visivel={verConfirmar}
          aoAlternar={alternarConfirmar}
          erro={erros['confirmarSenha']}
        />
        <button id="botaoSalvar" className="auth__botao" type="submit" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button id="botaoSair" className="auth__botao auth__botao--secundario" type="button" onClick={aoSair}>
          Sair da conta
        </button>
      </form>
    </>
  );
}
