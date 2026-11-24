import { estado } from '../estado/estado.js';
import { criarCapa } from '../capas/capas.js';
import { esc, dataLegivel, dataHora, normalizar, prepararDialog } from '../util/util.js';

const dialog = document.getElementById('detalhes');
const conteudo = document.getElementById('detalhes-conteudo');

let origem = null;

function render(livro) {
  const doMesmoAutor = estado.livros.filter(
    (l) => l.id !== livro.id && normalizar(l.autor) === normalizar(livro.autor)
  );

  conteudo.innerHTML = `
    <div class="det-palco">
      <div class="det-capa"></div>
    </div>

    <div class="det-corpo">
      ${livro.categoria ? `<p class="rotulo">${esc(livro.categoria)}</p>` : ''}
      <h2 class="det-titulo" id="detalhes-titulo">${esc(livro.nome)}</h2>
      <p class="det-autor">por <strong>${esc(livro.autor)}</strong></p>

      <p class="det-descricao">${livro.descricao ? esc(livro.descricao) : '<span class="det-vazio">Sem descrição cadastrada.</span>'}</p>

      <dl class="det-ficha">
        <div><dt>Editora</dt><dd>${esc(livro.editora || '—')}</dd></div>
        <div><dt>Publicação</dt><dd>${esc(dataLegivel(livro.data_publicacao))}</dd></div>
        <div><dt>Categoria</dt><dd>${esc(livro.categoria || '—')}</dd></div>
        <div><dt>No acervo desde</dt><dd>${esc(dataHora(livro.createdAt))}</dd></div>
        <div><dt>ID</dt><dd class="det-mono">#${esc(String(livro.id ?? '—').padStart(3, '0'))}</dd></div>
      </dl>

      ${doMesmoAutor.length ? `
        <section class="det-relacionados">
          <h3>Mais de ${esc(livro.autor)}</h3>
          <ul>
            ${doMesmoAutor.map((l) => `
              <li><button type="button" data-id="${esc(l.id)}">
                <span class="det-rel-capa"></span>
                <span><strong>${esc(l.nome)}</strong><small>${esc(dataLegivel(l.data_publicacao))}</small></span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
              </button></li>`).join('')}
          </ul>
        </section>` : ''}
    </div>
  `;

  conteudo.querySelector('.det-capa').append(criarCapa(livro, { tamanho: 'g' }));
  conteudo.querySelectorAll('.det-relacionados button').forEach((btn) => {
    const rel = estado.livros.find((l) => String(l.id) === btn.dataset.id);
    if (rel) btn.querySelector('.det-rel-capa').append(criarCapa(rel, { tamanho: 'p' }));
  });

  // Fundo do palco acompanha a cor da capa
  const capa = conteudo.querySelector('.capa');
  dialog.style.setProperty('--palco', capa.style.getPropertyValue('--capa-fundo'));
}

export function abrirDetalhes(livro, elementoOrigem) {
  origem = elementoOrigem ?? document.activeElement;
  render(livro);
  conteudo.scrollTop = 0;
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.gaveta-fechar').focus({ preventScroll: true });
}

export function iniciarDetalhes() {
  prepararDialog(dialog, () => origem?.focus?.({ preventScroll: true }));

  conteudo.addEventListener('click', (e) => {
    const btn = e.target.closest('.det-relacionados button');
    if (!btn) return;
    const livro = estado.livros.find((l) => String(l.id) === btn.dataset.id);
    if (livro) {
      render(livro);
      conteudo.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
