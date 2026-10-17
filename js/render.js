const app = document.getElementById('app');

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function metaLine(post) {
  const time = el('time', { datetime: post.date }, formatDate(post.date));
  const line = el('div', { class: 'meta' }, time);
  if (post.tags && post.tags.length) {
    line.append(el('span', { class: 'tags' }, ...post.tags.map((t) => el('span', { class: 'tag' }, t))));
  }
  return line;
}

// 마크다운이 만든 HTML에서 스크립트 실행 경로를 제거한다.
function sanitize(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, iframe, object, embed, link, meta, base, form').forEach((n) => n.remove());
  doc.body.querySelectorAll('*').forEach((n) => {
    for (const attr of [...n.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && /^(javascript|data|vbscript):/.test(value))) {
        n.removeAttribute(attr.name);
      }
    }
    if (n.tagName === 'A' && /^https?:/i.test(n.getAttribute('href') || '')) {
      n.setAttribute('rel', 'noopener noreferrer');
      n.setAttribute('target', '_blank');
    }
    if (n.tagName === 'IMG') n.setAttribute('loading', 'lazy');
  });
  return doc.body.innerHTML;
}

export function setTitle(title) {
  document.title = title ? `${title} · My Blog` : 'My Blog';
}

export function renderList(posts) {
  setTitle('');
  if (!posts.length) {
    app.replaceChildren(el('p', { class: 'notice' }, '아직 작성된 글이 없습니다.'));
    return;
  }
  const items = posts.map((p) => el('li', { class: 'post-card' },
    el('h2', { class: 'post-card__title' }, el('a', { href: `#/post/${p.slug}` }, p.title)),
    p.summary ? el('p', { class: 'post-card__summary' }, p.summary) : '',
    metaLine(p),
  ));
  app.replaceChildren(
    el('h1', { class: 'page-title' }, '글 목록'),
    el('ul', { class: 'post-list' }, ...items),
  );
}

export function renderPost(post) {
  setTitle(post.title);
  const prose = el('div', { class: 'prose' });
  prose.innerHTML = sanitize(marked.parse(post.body));
  app.replaceChildren(
    el('a', { class: 'back-link', href: '#/' }, '← 목록으로'),
    el('article', { class: 'post' },
      el('header', { class: 'post__header' }, el('h1', { class: 'post__title' }, post.title), metaLine(post)),
      prose,
    ),
  );
}

export function renderMessage(title, message) {
  setTitle(title);
  app.replaceChildren(
    el('div', { class: 'notice' }, el('h1', { class: 'page-title' }, title), el('p', {}, message),
      el('a', { href: '#/' }, '← 목록으로')),
  );
}
