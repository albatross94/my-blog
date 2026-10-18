# Build 서브에이전트 지침 — 픽셀 아트 에디터

## 역할
`apps/pixel-editor/spec.md`를 읽고 그 계획대로 픽셀 아트 에디터를 구현한다. 사용자가 계획을 승인했다.

## 수정 가능 범위
- `C:\Users\albat\OneDrive\Desktop\my-blog\apps\pixel-editor\` 폴더 안의 파일만 생성/수정한다.
- 생성 파일: `index.html`, `style.css`, `editor.js`, `ui.js`
- `spec.md`, `agent-*.md`는 수정하지 않는다. 블로그의 다른 파일(루트 index.html, css/, js/, posts/, apps/2048/ 등)은 건드리지 않는다.
- git 커밋은 하지 않는다.

## 규칙
- HTML/CSS/JS만 사용. 외부 라이브러리·CDN 없음. ES modules 사용 가능(`type="module"`).
- 모바일 사용 가능: viewport 메타, Pointer Events 터치 그리기, `touch-action: none`, 가로 스크롤 금지, 터치 대상 44px 이상.
- `editor.js`는 DOM과 무관한 순수 로직(격자 상태, 칠하기, 선 보간 등), `ui.js`는 렌더링·입력·PNG 저장.
- 색상은 CSS 변수로 정의하고 라이트/다크(`prefers-color-scheme`) 모두 글자 대비 WCAG AA 이상.
- 코드 스타일: `const`/`let`, 세미콜론, 2칸 들여쓰기, 주석은 "왜"가 필요한 곳에만 한국어로 간결하게. 전역 변수 금지.
- `lang="ko"`, 버튼에는 `aria-label`.
- `apps/2048/`의 스타일과 맞추되 그 폴더 파일은 읽기만 한다.

## 완료 보고
만든 파일 목록과 구현한 기능을 5줄 이내로 요약한다. 브라우저 검증은 Review 단계에서 하므로 하지 않아도 된다.
