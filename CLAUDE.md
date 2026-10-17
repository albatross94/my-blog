# my-blog

마크다운(`.md`) 파일을 읽어 블로그 웹사이트로 렌더링하는 프로젝트.
**프레임워크·빌드 도구 없이 순수 HTML / CSS / JavaScript(ES modules)만 사용한다.**

## 목표

- 깔끔하고 읽기 좋은 디자인 (본문 가독성 최우선)
- 다크 모드 지원 (시스템 설정 자동 감지 + 수동 토글, 선택값 저장)
- 모바일 우선 반응형 레이아웃
- 글 추가는 `posts/`에 `.md` 파일을 넣고 목록(`posts/index.json`)에 등록하는 것으로 끝

## 기술 제약

- 프레임워크/번들러/트랜스파일러(React, Vue, Vite, webpack, TypeScript, Sass 등) 사용 금지
- npm 의존성 없음. `package.json`을 만들지 않는다.
- 마크다운 파서는 외부 라이브러리 1개만 허용: `js/vendor/marked.min.js`(저장소에 직접 포함, CDN 의존 X). 코드 하이라이트가 필요하면 `highlight.js`를 같은 방식으로 vendor 처리한다. 그 외 라이브러리는 추가하기 전에 사용자에게 확인한다.
- 최신 브라우저 기준 (CSS 변수, `fetch`, ES modules, `prefers-color-scheme` 사용 가능)

## 디렉터리 구조

```
my-blog/
├── index.html          # 단일 진입점 (SPA 셸: 헤더, 본문 컨테이너, 푸터)
├── css/
│   ├── base.css        # 리셋, CSS 변수(색상/타이포/간격), 라이트·다크 테마
│   ├── layout.css      # 헤더, 컨테이너, 목록, 반응형 브레이크포인트
│   └── post.css        # 글 본문(.prose) 스타일: 제목, 코드, 인용, 표, 이미지
├── js/
│   ├── main.js         # 진입점: 라우터 초기화, 테마 초기화
│   ├── router.js       # 해시 라우팅 (#/ , #/post/<slug>)
│   ├── posts.js        # index.json / .md 로드, frontmatter 파싱
│   ├── render.js       # 목록·글 화면 DOM 생성 (marked 호출, XSS 방지 포함)
│   ├── theme.js        # 다크 모드 토글 및 localStorage 저장
│   └── vendor/         # marked.min.js 등 외부 라이브러리 (수정 금지)
├── posts/
│   ├── index.json      # 글 목록 메타데이터 (slug, title, date, tags, summary)
│   └── <slug>.md       # 각 글 본문
├── assets/             # 이미지, 파비콘
└── CLAUDE.md
```

## 동작 방식

1. `main.js`가 `posts/index.json`을 fetch 해 목록을 만든다 (날짜 내림차순).
2. 라우터가 `#/post/<slug>`를 감지하면 `posts/<slug>.md`를 fetch.
3. 상단 frontmatter(`---` 블록)를 분리해 제목·날짜·태그를 얻고, 나머지를 `marked`로 HTML 변환해 `.prose` 컨테이너에 삽입.
4. 라우팅은 **해시 기반**으로 한다 (정적 호스팅/GitHub Pages에서 서버 설정 없이 동작).

### 글 형식

```markdown
---
title: 글 제목
date: 2026-10-16
tags: [일상, 개발]
summary: 목록에 보여줄 한 줄 요약
---

본문...
```

`index.json` 항목 예:
```json
{ "slug": "hello-world", "title": "글 제목", "date": "2026-10-16", "tags": ["일상"], "summary": "..." }
```

## 실행 / 확인

`file://`로 열면 `fetch`가 막히므로 반드시 로컬 정적 서버로 확인한다.

```powershell
npx serve .                    # Node 사용 (이 PC에는 python이 스토어 스텁뿐이라 동작하지 않음)
python -m http.server 8000     # Python이 설치된 환경이라면 http://localhost:8000
```

빌드·린트·테스트 명령은 없다. 변경 후에는 브라우저에서 직접 확인한다:
라이트/다크 양쪽, 모바일 폭(≈375px)과 데스크톱 폭, 글 목록 ↔ 글 상세 이동, 존재하지 않는 slug 처리.

## 디자인 가이드

- **색상**: `:root`의 CSS 변수로만 정의 (`--bg`, `--fg`, `--muted`, `--border`, `--accent`, `--code-bg`). 컴포넌트에서 색상 값을 하드코딩하지 않는다.
- **다크 모드**: `:root[data-theme="dark"]`로 변수 재정의. 초기값은 `prefers-color-scheme`, 사용자가 토글하면 `localStorage`의 `theme` 값이 우선. 페이지 깜빡임(FOUC) 방지를 위해 테마 적용 인라인 스크립트를 `<head>`에 둔다. 텍스트 대비는 WCAG AA 이상.
- **타이포그래피**: 본문 폭 `max-width: 42rem`(약 65~75자), 글자 크기 `1rem`~`1.125rem`, 행간 1.7 이상. 한글 가독성을 위해 시스템 폰트 스택(Pretendard가 있으면 우선, 없으면 `-apple-system`, `Malgun Gothic` 등)과 `word-break: keep-all`, `overflow-wrap: anywhere`를 사용.
- **반응형**: 모바일 우선으로 작성하고 `min-width` 미디어 쿼리로 확장. 좌우 여백 최소 16px, 가로 스크롤 금지(긴 코드 블록·표는 자체 `overflow-x: auto`). 터치 대상 최소 44px. `<meta name="viewport">` 필수.
- 이미지는 `max-width: 100%; height: auto`, `loading="lazy"`.
- 장식은 최소화: 넉넉한 여백, 얇은 구분선, 단일 강조색.

## 코드 컨벤션

- JS: ES modules, `const`/`let`, 세미콜론 사용, 2칸 들여쓰기, 함수 단위로 작게 분리. 전역 변수 금지.
- CSS: 클래스 기반(BEM 비슷한 단순 네이밍), id 선택자·`!important` 지양, 논리적 속성(`margin-inline` 등) 허용.
- HTML: 시맨틱 태그(`header`, `main`, `article`, `nav`, `time`) 사용, `lang="ko"`, 버튼에는 `aria-label`.
- 주석은 "왜"가 필요한 곳에만 한국어로 간결하게.

## 보안

- 마크다운에서 변환된 HTML은 `innerHTML`에 넣기 전에 반드시 sanitize 한다 (최소한 `<script>`, `on*` 속성, `javascript:` URL 제거). 글은 본인이 작성하지만 습관적으로 지킨다.
- slug는 `^[a-z0-9-]+$`만 허용하고 fetch 경로에 그대로 이어 붙이지 않는다 (`index.json`에 있는 값만 사용).

## 작업 시 주의

- 새 기능을 추가할 때 위의 기술 제약(무프레임워크, 의존성 최소화)을 먼저 확인한다.
- `js/vendor/`는 직접 수정하지 않는다.
- 샘플 글(`posts/hello-world.md`)은 제목, 코드 블록, 인용, 표, 이미지, 목록을 포함해 스타일 확인용으로 유지한다.
