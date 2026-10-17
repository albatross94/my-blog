const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return root.dataset.theme || (media.matches ? 'dark' : 'light');
}

export function initTheme() {
  const button = document.getElementById('theme-toggle');
  const sync = () => button.setAttribute('aria-label', currentTheme() === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
  sync();

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      // 저장 불가 환경에서는 현재 세션에만 적용한다.
    }
    sync();
  });

  media.addEventListener('change', sync);
}
