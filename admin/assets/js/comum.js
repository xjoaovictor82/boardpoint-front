/* =========================================================================
   BOARD POINT — Admin: script compartilhado entre todas as páginas internas
   Protege a sessão, cuida do botão sair, toasts e helper de requisição.
   ========================================================================= */

// Caminho relativo até a pasta api/, a partir de admin/pages/*.html
const API_BASE = '../api/';

async function apiFetch(caminho, opcoes = {}) {
  const resp = await fetch(API_BASE + caminho, {
    credentials: 'same-origin',
    ...opcoes,
  });
  const data = await resp.json();
  if (!data.sucesso && resp.status === 401) {
    window.location.href = '../login.html';
    throw new Error('Não autenticado');
  }
  return data;
}

function mostrarToast(mensagem, tipo = 'sucesso') {
  let toast = document.getElementById('toastGlobal');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastGlobal';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mensagem;
  toast.className = 'toast mostrar' + (tipo === 'erro' ? ' erro' : '');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('mostrar'), 3200);
}

async function protegerPagina() {
  try {
    const data = await apiFetch('auth.php?acao=status');
    if (!data.dados.autenticado) {
      window.location.href = '../login.html';
      return null;
    }
    const elUsuario = document.getElementById('usuarioLogado');
    if (elUsuario) elUsuario.textContent = data.dados.usuario;
    return data.dados.usuario;
  } catch (e) {
    window.location.href = '../login.html';
    return null;
  }
}

function configurarBotaoSair() {
  const botao = document.getElementById('botaoSair');
  if (!botao) return;
  botao.addEventListener('click', async () => {
    await apiFetch('auth.php?acao=logout', { method: 'POST' });
    window.location.href = '../login.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  protegerPagina();
  configurarBotaoSair();
});
