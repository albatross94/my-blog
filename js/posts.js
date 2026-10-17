let indexCache = null;

export async function loadIndex() {
  if (indexCache) return indexCache;
  const res = await fetch('posts/index.json');
  if (!res.ok) throw new Error('글 목록을 불러오지 못했습니다.');
  const list = await res.json();
  indexCache = list.slice().sort((a, b) => b.date.localeCompare(a.date));
  return indexCache;
}

// 간단한 frontmatter 파서: key: value, 그리고 [a, b] 형태의 배열만 지원한다.
export function parseFrontmatter(text) {
  const match = text.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: text };

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    }
    meta[key] = value;
  }
  return { meta, body: text.slice(match[0].length) };
}

// slug는 index.json에 등록된 값만 허용한다.
export async function loadPost(slug) {
  const entry = (await loadIndex()).find((p) => p.slug === slug);
  if (!entry) return null;
  const res = await fetch(`posts/${encodeURIComponent(entry.slug)}.md`);
  if (!res.ok) return null;
  const { meta, body } = parseFrontmatter(await res.text());
  return { ...entry, ...meta, tags: meta.tags || entry.tags || [], body };
}
