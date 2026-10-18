# Review 서브에이전트 지침 — 픽셀 아트 에디터

## 역할
Build 결과물(`apps/pixel-editor/`)을 검증하고 `review.md`를 작성한다. 문제가 있으면 수정한다.

## 수정 가능 범위
- `C:\Users\albat\OneDrive\Desktop\my-blog\apps\pixel-editor\` 안의 `index.html`, `style.css`, `editor.js`, `ui.js` (버그 수정에 한함)
- 생성 파일: `apps/pixel-editor/review.md`
- `spec.md`, `agent-*.md`, 블로그의 다른 파일, `apps/2048/`은 수정 금지. git 커밋 금지.

## 검증 항목
1. `spec.md`의 검증 체크리스트 전부
2. 브라우저 동작: 로컬 정적 서버(`npx --yes serve . -l <포트>`, 저장소 루트에서)로 띄워 Chrome 도구(mcp__claude-in-chrome__*, ToolSearch로 먼저 로드)로 확인.
   - 클릭·드래그로 칠하기, 빠른 드래그 시 선 보간(끊김 없음), 격자 밖 포인터 무시
   - 팔레트 선택·선택 표시·현재 색 미리보기, 지우개, 전체 지우기
   - PNG 저장: 실제 다운로드는 하지 말고, 페이지 JS로 저장 로직이 만드는 canvas를 `toDataURL`/픽셀 읽기로 확인한다 (256x256, 칠한 셀 색 일치, 빈 셀 투명, 격자선 없음, 파일명 형식)
   - 모바일 폭: 창 리사이즈가 뷰포트에 반영되지 않을 수 있으므로, 같은 오리진에 375px 폭 iframe을 만들어 확인 (가로 스크롤 없음, 격자 정사각형, 터치 대상 44px 이상)
   - 다크 모드는 `prefers-color-scheme: dark` 규칙 존재와 대비 계산으로 확인
   - 콘솔 에러 없음
3. 코드 검토: `editor.js` 로직(Bresenham 선 보간, 경계 처리), XSS/오류 처리, 스타일 컨벤션
4. 주의: 전체 지우기는 `window.confirm`을 쓴다. **브라우저 자동화가 모달 때문에 멈추므로 클릭하기 전에 반드시 페이지 JS로 `window.confirm = () => true`로 덮어쓴 뒤** 확인한다. 이 방식이 불가능하면 해당 항목은 "미검증"으로 기록한다. (`confirm` 대신 인라인 확인 UI로 바꾸는 것이 더 낫다고 판단되면 수정하고 review.md에 기록해도 된다.)

## 완료 보고
`review.md`에 항목별 결과(통과/실패/수정함/미검증)를 기록하고, 5줄 이내로 요약 보고한다. 서버는 검증 후 종료하고, 열어 둔 브라우저 탭은 정리한다.
