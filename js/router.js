import { loadIndex, loadPost } from './posts.js';
import { renderList, renderPost, renderMessage } from './render.js';

async function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const post = hash.match(/^\/post\/([a-z0-9-]+)$/);

  try {
    if (hash === '/') {
      renderList(await loadIndex());
    } else if (post) {
      const data = await loadPost(post[1]);
      if (data) renderPost(data);
      else renderMessage('글을 찾을 수 없습니다', '주소가 잘못되었거나 삭제된 글입니다.');
    } else {
      renderMessage('페이지를 찾을 수 없습니다', '존재하지 않는 주소입니다.');
    }
  } catch (err) {
    renderMessage('오류가 발생했습니다', err.message);
  }
  window.scrollTo(0, 0);
}

export function initRouter() {
  window.addEventListener('hashchange', route);
  route();
}
