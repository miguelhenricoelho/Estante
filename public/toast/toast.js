import { esc } from '../util/util.js';

const area = document.getElementById('toasts');

const ICONES = {
  sucesso: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  erro: '<svg viewBox="0 0 24 24"><path d="M12 7v6M12 16.5v.5"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 11v6M12 7.5v.5"/></svg>'
};

export function mostrarToast(mensagem, tipo = 'info', duracao = 4200) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.innerHTML = `<span class="toast-icone" aria-hidden="true">${ICONES[tipo] ?? ICONES.info}</span><p>${esc(mensagem)}</p>`;
  area.append(toast);

  const sair = () => {
    toast.classList.add('toast--saindo');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(sair, duracao);
  toast.addEventListener('click', () => { clearTimeout(timer); sair(); });
}
