# Build 서브에이전트 지침 — 2048 게임

## 역할
`apps/2048/spec.md`를 읽고 그 계획대로 2048 웹앱을 구현한다. 사용자가 계획을 승인했다.

## 수정 가능 범위
- `C:\Users\albat\OneDrive\Desktop\my-blog\apps\2048\` 폴더 안의 파일만 생성/수정한다.
- 생성 파일: `index.html`, `style.css`, `game.js`, `ui.js`
- `spec.md`, `agent-*.md`는 수정하지 않는다. 블로그의 다른 파일(루트 index.html, css/, js/, posts/ 등)은 건드리지 않는다.
- git 커밋은 하지 않는다.

## 규칙
- HTML/CSS/JS만 사용. 외부 라이브러리·CDN 없음. ES modules 사용 가능(`type="module"`).
- 모바일 사용 가능: viewport 메타, 터치 스와이프, 가로 스크롤 금지.
- `game.js`는 DOM과 무관한 순수 로직, `ui.js`는 렌더링·입력·localStorage.
- 코드 스타일: `const`/`let`, 세미콜론, 2칸 들여쓰기, 주석은 "왜"가 필요한 곳에만 한국어로 간결하게.
- 방향키 입력 시 페이지 스크롤이 일어나지 않도록 `preventDefault` 처리.
- `lang="ko"`, 버튼에는 `aria-label`.

## 완료 보고
만든 파일 목록과 구현한 기능을 5줄 이내로 요약한다. 브라우저 검증은 Review 단계에서 하므로 하지 않아도 된다.
