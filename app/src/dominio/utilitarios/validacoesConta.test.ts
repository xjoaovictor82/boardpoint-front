import { describe, expect, it } from 'vitest';
import {
  errosConta,
  errosLogin,
  formatarCpf,
  validarCpf,
  validarEmail,
  validarSenha,
} from './validacoesConta';

describe('CPF', () => {
  it('aceita CPFs válidos, com ou sem máscara', () => {
    expect(validarCpf('529.982.247-25')).toBe(true);
    expect(validarCpf('52998224725')).toBe(true);
  });

  it('recusa dígito verificador errado, tamanho errado e números repetidos', () => {
    expect(validarCpf('529.982.247-24')).toBe(false);
    expect(validarCpf('123')).toBe(false);
    expect(validarCpf('111.111.111-11')).toBe(false);
    expect(validarCpf('')).toBe(false);
  });

  it('coloca a máscara enquanto digita', () => {
    expect(formatarCpf('5')).toBe('5');
    expect(formatarCpf('5299')).toBe('529.9');
    expect(formatarCpf('5299822')).toBe('529.982.2');
    expect(formatarCpf('52998224725999')).toBe('529.982.247-25');
  });
});

describe('e-mail e senha (mesmas regras do back-end)', () => {
  it('valida e-mail', () => {
    expect(validarEmail('nome@exemplo.com')).toBe(true);
    expect(validarEmail('nome@exemplo')).toBe(false);
    expect(validarEmail('nome exemplo@x.com')).toBe(false);
    expect(validarEmail('a@b.c')).toBe(false);
    expect(validarEmail(`${'a'.repeat(150)}@x.com`)).toBe(false);
  });

  it('exige 8 caracteres com maiúscula, minúscula, número e símbolo', () => {
    expect(validarSenha('Abcdef1!')).toBe(true);
    expect(validarSenha('Abcde1!')).toBe(false); // curta
    expect(validarSenha('abcdef1!')).toBe(false); // sem maiúscula
    expect(validarSenha('ABCDEF1!')).toBe(false); // sem minúscula
    expect(validarSenha('Abcdefg!')).toBe(false); // sem número
    expect(validarSenha('Abcdefg1')).toBe(false); // sem símbolo
    expect(validarSenha('Abcdef1_')).toBe(true); // underline conta como símbolo
  });
});

describe('errosLogin / errosConta', () => {
  it('login pede e-mail e senha', () => {
    expect(errosLogin('', '')).toEqual({ email: 'Informe seu e-mail.', senha: 'Informe sua senha.' });
    expect(errosLogin('x', 'a')['email']).toMatch(/inválido/);
    expect(errosLogin('a@b.com', 'a')).toEqual({});
  });

  const valido = { nome: 'Maria Souza', email: 'maria@x.com', cpf: '529.982.247-25', senha: 'Abcdef1!', confirmarSenha: 'Abcdef1!' };

  it('cadastro completo e correto não tem erros', () => {
    expect(errosConta(valido, true, true)).toEqual({});
  });

  it('cadastro exige senha e confirmação igual', () => {
    expect(errosConta({ ...valido, senha: '', confirmarSenha: '' }, true, true)['senha']).toBe('Crie uma senha.');
    expect(errosConta({ ...valido, confirmarSenha: 'outra' }, true, true)['confirmarSenha']).toBe('As senhas não coincidem.');
  });

  it('no perfil a senha em branco significa "manter a atual" e o e-mail não é validado', () => {
    const perfil = { ...valido, email: '', senha: '', confirmarSenha: '' };
    expect(errosConta(perfil, false, false)).toEqual({});
    expect(errosConta({ ...perfil, senha: 'fraca' }, false, false)['senha']).toMatch(/mínimo 8 caracteres/);
  });
});
