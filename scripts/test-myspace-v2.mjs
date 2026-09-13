import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import assertLoose from 'node:assert';
// deepEqual 비교 대상 중 일부는 vm.runInNewContext 안에서 생성된 객체라 프로토타입이
// 테스트 파일의 리얼름과 다르다. assert/strict의 deepEqual(=deepStrictEqual)은 프로토타입까지
// 비교해 값이 같아도 실패하므로, 구조 비교만 하는 loose deepEqual을 그 용도로 쓴다.

const html = fs.readFileSync(new URL('../myspace-v2-prototype.html', import.meta.url), 'utf8');
const m = html.match(/<script id="app">([\s\S]*?)<\/script>/);
assert(m, 'script#app 없음');
const src = m[1];
const cut = src.indexOf('// ===== RENDER =====');
assert(cut > 0, 'RENDER 마커 없음');
const EXPORTS = '\n;({KEY,todayStr,defaultState,loadState,saveState,ensureDay,blank,formulaCount,endDefined,dayProgress,keywords,judgeSignal,stageOf,greeting,canFire,addSuggestion,replaceItem,freeReply,lastReview,daysLeft,fmtDate,USER,STAGES,BOUNDARY,FORMULA,PAST_DAYS,SUGGESTIONS,COACH,FREE,FREE_FALLBACK,blankReview,reviewDone,reviewHintFor,REVIEW_Q,KEY_QUESTION,ITEM_PH,SUGGEST,dumpAdd,dumpRemove,dumpPick,MAX_PICK})';
const ctx = { location: { search: '' }, URLSearchParams, console };
const L = vm.runInNewContext(src.slice(0, cut) + EXPORTS, ctx);

function mem(init) { const s = { ...init }; return { getItem: k => (k in s ? s[k] : null), setItem: (k, v) => { s[k] = String(v); }, _s: s }; }
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

// --- Task 1 ---
t('defaultState: v=3, 지난 4일, 회고 객체', () => {
  const s = L.defaultState();
  assert.equal(s.v, 3);
  assert.equal(Object.keys(s.days).length, 4);
  assert.equal(s.days['2026-09-12'].review.q1, true);
  assert.equal(s.boundary.formula.strategy, '');
});
t('loadState: 저장 없음 → 기본', () => {
  assert.equal(L.loadState(mem({})).user.name, '소정');
});
t('loadState: v 다르면 무시', () => {
  const st = mem({ [L.KEY]: JSON.stringify({ v: 2, user: { name: 'X' } }) });
  assert.equal(L.loadState(st).user.name, '소정');
});
t('loadState: v=3이면 복원', () => {
  const s = L.defaultState(); s.user.name = '호';
  const st = mem({ [L.KEY]: JSON.stringify(s) });
  assert.equal(L.loadState(st).user.name, '호');
});
t('loadState: 깨진 JSON → 기본', () => {
  assert.equal(L.loadState(mem({ [L.KEY]: '{oops' })).v, 3);
});
t('saveState: 실패 시 onFail', () => {
  let failed = false;
  const bad = { setItem() { throw new Error('quota'); } };
  assert.equal(L.saveState(bad, L.defaultState(), () => { failed = true; }), false);
  assert.equal(failed, true);
});
t('ensureDay: 빈 3줄 생성, 멱등', () => {
  const s = L.defaultState();
  const d = L.ensureDay(s, '2026-09-13');
  assert.equal(d.items.length, 3);
  assertLoose.deepEqual(d.items[0], { text: '', done: false });
  assertLoose.deepEqual(d.review, { q1: null, q2: null, text: '' });
  d.items[0].text = 'a';
  assert.equal(L.ensureDay(s, '2026-09-13').items[0].text, 'a');
});
t('formulaCount / endDefined', () => {
  assert.equal(L.formulaCount(L.FORMULA), 3);
  assert.equal(L.formulaCount({ numeric: ' ', customer: '', problem: '', strategy: '' }), 0);
  assert.equal(L.endDefined({ numeric: '', customer: 'x' }), true);
  assert.equal(L.endDefined({ numeric: '', customer: '' }), false);
});
t('dayProgress', () => {
  assertLoose.deepEqual(L.dayProgress(L.PAST_DAYS['2026-09-10']), { filled: 3, done: 3 });
  assertLoose.deepEqual(L.dayProgress({ items: [L.blank(), L.blank(), L.blank()] }), { filled: 0, done: 0 });
});
t('daysLeft / fmtDate', () => {
  assert.equal(L.daysLeft('2026-11-30', '2026-09-13'), 78);
  assert.equal(L.fmtDate('2026-09-13'), '9월 13일 일요일');
});
t('lastReview: 오늘 이전 가장 최근 회고', () => {
  const r = L.lastReview(L.defaultState(), '2026-09-13');
  assert.equal(r.date, '2026-09-12');
  assert.match(r.review, /썸네일/);
});

// --- Task 4 ---
t('greeting: 18시 기준', () => { assert.equal(L.greeting(9), 'am'); assert.equal(L.greeting(17), 'am'); assert.equal(L.greeting(18), 'pm'); });
t('canFire: 하루 1회, 항목별 1회', () => {
  const seen = {};
  assert.equal(L.canFire(seen, '2026-09-13', 'greet'), true);
  assert.equal(L.canFire(seen, '2026-09-13', 'greet'), false);
  assert.equal(L.canFire(seen, '2026-09-14', 'greet'), true);
  assert.equal(L.canFire(seen, '2026-09-13', 'items', 0), true);
  assert.equal(L.canFire(seen, '2026-09-13', 'items', 0), false);
  assert.equal(L.canFire(seen, '2026-09-13', 'items', 1), true);
});
t('freeReply: 키워드 매칭·폴백', () => {
  assert.match(L.freeReply('요즘 정체기인 것 같아요'), /끝점/);
  assert.match(L.freeReply('전략을 어떻게 잡죠'), /노이즈/);
  assert.equal(L.freeReply('점심 뭐 먹지'), L.FREE_FALLBACK);
});
t('COACH 템플릿: 이름 포함', () => {
  assert.match(L.COACH.greetAm('소정', '어제 회고'), /소정님/);
  assert.match(L.COACH.greetPm('소정', 2, 3), /2개/);
});

// --- Task 5 ---
t('keywords: 조사 제거·2글자 이상', () => {
  const k = L.keywords(L.FORMULA);
  assert(k.includes('완강률')); assert(k.includes('정체기')); assert(!k.includes('이'));
});
t('judgeSignal: 키워드 매칭이면 시그널, 아니면 노이즈, 빈 항목 null', () => {
  assert.equal(L.judgeSignal({ text: '완강률 대시보드 보기', done: false }, L.FORMULA), 'signal');
  assert.equal(L.judgeSignal({ text: '팀 주간 회의', done: false }, L.FORMULA), 'noise');
  assert.equal(L.judgeSignal({ text: '  ', done: false }, L.FORMULA), null);
});
t('stageOf: 범위 클램프', () => { assert.equal(L.stageOf(0).n, 1); assert.equal(L.stageOf(9).n, 6); assert.equal(L.stageOf('3').n, 3); });

// --- Task 6 ---
t('addSuggestion: 빈 줄에 삽입, 꽉 차면 full', () => {
  const day = { items: [L.blank(), { text: 'x', done: false, tag: null }, L.blank()], review: '' };
  const r = L.addSuggestion(day, L.SUGGESTIONS[0]);
  assertLoose.deepEqual(r, { ok: true, index: 0 });
  L.addSuggestion(day, L.SUGGESTIONS[1]);
  assertLoose.deepEqual(L.addSuggestion(day, L.SUGGESTIONS[2]), { ok: false, reason: 'full' });
});
t('replaceItem: 교체하고 옛 항목 반환', () => {
  const day = { items: [{ text: 'a', done: true, tag: null }, L.blank(), L.blank()], review: '' };
  const old = L.replaceItem(day, 0, L.SUGGESTIONS[3]);
  assert.equal(old.text, 'a'); assert.equal(day.items[0].text, L.SUGGESTIONS[3].text); assert.equal(day.items[0].done, false);
});

// --- Task 10 ---
t('reviewDone: text 있어야 완료', () => {
  assert.equal(L.reviewDone({ q1: true, q2: false, text: '' }), false);
  assert.equal(L.reviewDone({ q1: null, q2: null, text: '한 줄' }), true);
});
t('reviewHintFor: OX에 따라 유도 문구', () => {
  const st = L.stageOf(2);
  assert.match(L.reviewHintFor({ q1: false, q2: null, text: '' }, st), /끼어들/);
  assert.match(L.reviewHintFor({ q1: true, q2: true, text: '' }, st), /바꿀지/);
  assert.equal(L.reviewHintFor({ q1: null, q2: null, text: '' }, st), st.reviewPh);
});
t('SUGGEST 플래그 꺼짐, 키 퀘스천·문항 상수', () => {
  assert.equal(L.SUGGEST, false);
  assert.match(L.KEY_QUESTION, /3가지/);
  assert.equal(L.REVIEW_Q.length, 2);
  assert.equal(L.ITEM_PH.length, 3);
});

// --- Task 11 ---
t('dumpAdd/dumpRemove: 공백 무시·중복 무시', () => {
  const day = L.ensureDay(L.defaultState(), '2026-09-13');
  assert.equal(L.dumpAdd(day, '  '), false);
  assert.equal(L.dumpAdd(day, '썸네일 A/B'), true);
  assert.equal(L.dumpAdd(day, '썸네일 A/B'), false);
  L.dumpAdd(day, '회의');
  assert.equal(day.dump.length, 2);
  L.dumpRemove(day, 0);
  assertLoose.deepEqual(day.dump, ['회의']);
});
t('dumpPick: 선택 3개는 items로, 나머지는 dropped로, 첫 선택이 Frog', () => {
  const day = L.ensureDay(L.defaultState(), '2026-09-13');
  ['a', 'b', 'c', 'd', 'e'].forEach(x => L.dumpAdd(day, x));
  const r = L.dumpPick(day, [3, 1, 0]);
  assert.equal(r.ok, true);
  assert.equal(day.items[0].text, 'd');
  assert.equal(day.items[2].text, 'a');
  assertLoose.deepEqual(day.dropped, ['c', 'e']);
  assertLoose.deepEqual(day.dump, []);
});
t('dumpPick: 0개 또는 4개 이상은 거부', () => {
  const day = L.ensureDay(L.defaultState(), '2026-09-13');
  ['a', 'b', 'c', 'd'].forEach(x => L.dumpAdd(day, x));
  assert.equal(L.dumpPick(day, []).ok, false);
  assert.equal(L.dumpPick(day, [0, 1, 2, 3]).ok, false);
  assert.equal(day.dump.length, 4);
});
t('ensureDay: dump/dropped 초기화, 구데이터엔 보강', () => {
  const s = L.defaultState();
  const d = L.ensureDay(s, '2026-09-13');
  assertLoose.deepEqual(d.dump, []); assertLoose.deepEqual(d.dropped, []);
  const old = L.ensureDay(s, '2026-09-12');
  assert(Array.isArray(old.dump) && Array.isArray(old.dropped));
});

console.log(`\n${n} tests passed`);
