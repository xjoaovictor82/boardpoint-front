import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { mensagemAmigavel } from '../dominio/utilitarios/mensagensErro';
import { errosConta, formatarCpf, validarCpf } from '../dominio/utilitarios/validacoesConta';
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

export function PaginaCadastro() {
  const { logado } = useSessao();
  const navegar = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [verSenha, alternarSenha, definirVerSenha] = useAlternar();
  const [verConfirmar, alternarConfirmar, definirVerConfirmar] = useAlternar();
  const [senhaSugerida, setSenhaSugerida] = useState(false);
  const [alerta, setAlerta] = useState<DadosAlerta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sugerindo, setSugerindo] = useState(false);
  const { erros, substituir, limpar, definir } = useErrosCampos();

  if (logado) return <Navigate to="/" replace />;

  const sugerirSenha = async (): Promise<void> => {
    setAlerta(null);
    setSugerindo(true);
    try {
      const sugestao = await servicoConta.sugerirSenha();
      // Deixa a senha visível (olho aberto) para a pessoa guardar antes de criar a conta.
      definirVerSenha(true);
      definirVerConfirmar(true);
      setSenha(sugestao);
      setConfirmarSenha(sugestao);
      limpar('senha');
      limpar('confirmarSenha');
      setSenhaSugerida(true);
      setAlerta({
        texto: 'Senha sugerida preenchida. Copie e guarde em um lugar seguro antes de criar a conta.',
        tipo: 'sucesso',
      });
    } catch (erro) {
      setAlerta({ texto: mensagemAmigavel(erro, 'cadastro'), tipo: 'erro' });
    } finally {
      setSugerindo(false);
    }
  };

  const copiarSenha = async (): Promise<void> => {
    if (senha === '') return;
    try {
      await navigator.clipboard.writeText(senha);
      setAlerta({ texto: 'Senha copiada! Cole em um lugar seguro antes de criar a conta.', tipo: 'sucesso' });
    } catch {
      setAlerta({
        texto: 'Não foi possível copiar sozinho. Selecione a senha no campo e aperte Ctrl+C.',
        tipo: 'erro',
      });
    }
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    setAlerta(null);

    const campos: CamposConta = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      cpf,
      senha,
      confirmarSenha,
    };
    const encontrados = errosConta(campos, true, true);
    substituir(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await servicoConta.cadastrar(campos);
      // Depois do cadastro, vai para o login (a pessoa entra com a conta que acabou de criar).
      navegar('/cliente/login?cadastro=ok');
    } catch (erro) {
      setAlerta({ texto: mensagemAmigavel(erro, 'cadastro'), tipo: 'erro' });
      setEnviando(false);
    }
  };

  return (
    <LayoutAuth
      tituloAba="Cadastrar — Board Point"
      titulo="Cadastrar"
      subtitulo="Crie sua conta para comprar na Board Point."
    >
      <AlertaConta alerta={alerta} />

      <form id="formCadastro" noValidate onSubmit={(evento) => void enviar(evento)}>
        <CampoTexto
          nome="nome"
          rotulo="Nome completo"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
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
          placeholder="voce@exemplo.com"
          maxLength={150}
          valor={email}
          aoMudar={(valor) => {
            setEmail(valor);
            limpar('email');
          }}
          erro={erros['email']}
        />
        <CampoTexto
          nome="cpf"
          rotulo="CPF"
          type="text"
          autoComplete="off"
          inputMode="numeric"
          placeholder="000.000.000-00"
          maxLength={14}
          valor={cpf}
          aoMudar={(valor) => {
            setCpf(formatarCpf(valor));
            limpar('cpf');
          }}
          // Valida o CPF ao sair do campo (campo vazio só reclama ao enviar).
          onBlur={() => {
            if (cpf.trim() !== '') definir('cpf', validarCpf(cpf) ? '' : 'CPF inválido. Confira os números.');
          }}
          erro={erros['cpf']}
        />
        <CampoSenha
          nome="senha"
          rotulo="Crie sua senha"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          valor={senha}
          aoMudar={(valor) => {
            setSenha(valor);
            limpar('senha');
          }}
          visivel={verSenha}
          aoAlternar={alternarSenha}
          erro={erros['senha']}
        />
        <small className="campo__dica" style={{ marginTop: -8, marginBottom: 14 }}>
          Use maiúscula, minúscula, número e símbolo.
        </small>
        <div className="auth__sugestao">
          <button
            id="botaoSugerirSenha"
            className="auth__botao auth__botao--secundario"
            type="button"
            disabled={sugerindo}
            onClick={() => void sugerirSenha()}
          >
            {sugerindo ? 'Gerando...' : 'Sugerir uma senha forte'}
          </button>
          <button
            id="botaoCopiarSenha"
            className="auth__botao auth__botao--secundario"
            type="button"
            hidden={!senhaSugerida}
            onClick={() => void copiarSenha()}
          >
            Copiar senha
          </button>
        </div>
        <CampoSenha
          nome="confirmarSenha"
          rotulo="Confirme a senha"
          autoComplete="new-password"
          placeholder="Repita a senha"
          valor={confirmarSenha}
          aoMudar={(valor) => {
            setConfirmarSenha(valor);
            limpar('confirmarSenha');
          }}
          visivel={verConfirmar}
          aoAlternar={alternarConfirmar}
          erro={erros['confirmarSenha']}
        />
        <button id="botaoCadastrar" className="auth__botao" type="submit" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="auth__troca">
        Já tem conta? <Link to="/cliente/login">Entrar</Link>
      </p>
    </LayoutAuth>
  );
}
