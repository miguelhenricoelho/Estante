const MAPA_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA_ESCAPE[c]);

export const normalizar = (valor) =>
  String(valor ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function hash(texto) {
  let h = 2166136261;
  for (const ch of String(texto)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function ano(data) {
  const m = String(data ?? '').match(/^(\d{4})/);
  return m ? m[1] : null;
}

/** Datas "AAAA-01-01" (só o ano conhecido) aparecem apenas como ano. */
export function dataLegivel(data) {
  if (!data) return '—';
  const [a, m, d] = String(data).slice(0, 10).split('-').map(Number);
  if (!a) return '—';
  if (m === 1 && d === 1) return String(a);
  return new Date(Date.UTC(a, (m || 1) - 1, d || 1)).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
}

export function dataHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function debounce(fn, ms = 140) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** Fecha um <dialog> esperando a animação de saída terminar. */
export function fecharDialog(dialog) {
  if (!dialog.open || dialog.classList.contains('saindo')) return;
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzido) return dialog.close();
  dialog.classList.add('saindo');
  dialog.addEventListener('animationend', () => {
    dialog.classList.remove('saindo');
    dialog.close();
  }, { once: true });
}

/** Liga botões [data-fechar], clique no fundo e Esc com animação. */
export function prepararDialog(dialog, aoFechar) {
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-fechar]')) fecharDialog(dialog);
  });
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    fecharDialog(dialog);
  });
  if (aoFechar) dialog.addEventListener('close', aoFechar);
}
