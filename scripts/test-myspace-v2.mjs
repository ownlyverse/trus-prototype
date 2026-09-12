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
const EXPORTS = '\n;({KEY,todayStr,defaultState,loadState,saveState,ensureDay,blank,formulaCount,endDefined,dayProgress,keywords,judgeSignal,stageOf,greeting,canFire,addSuggestion,replaceItem,freeReply,lastReview,daysLeft,fmtDate,USER,STAGES,BOUNDARY,FORMULA,PAST_DAYS,SUGGESTIONS,COACH,FREE,FREE_FALLBACK,TAG_LABEL})';
const ctx = { location: { search: '' }, URLSearchParams, console };
const L = vm.runInNewContext(src.slice(0, cut) + EXPORTS, ctx);

function mem(init) { const s = { ...init }; return { getItem: k => (k in s ? s[k] : null), setItem: (k, v) => { s[k] = String(v); }, _s: s }; }
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

// --- Task 1 ---
t('defaultState: v=2, 지난 4일, 오늘 없음', () => {
  const s = L.defaultState();
  assert.equal(s.v, 2);
  assert.equal(Object.keys(s.days).length, 4);
  assert.equal(s.boundary.formula.strategy, '');
});
t('loadState: 저장 없음 → 기본', () => {
  assert.equal(L.loadState(mem({})).user.name, '소정');
});
t('loadState: v 다르면 무시', () => {
  const st = mem({ [L.KEY]: JSON.stringify({ v: 1, user: { name: 'X' } }) });
  assert.equal(L.loadState(st).user.name, '소정');
});
t('loadState: v=2면 복원', () => {
  const s = L.defaultState(); s.user.name = '호';
  const st = mem({ [L.KEY]: JSON.stringify(s) });
  assert.equal(L.loadState(st).user.name, '호');
});
t('loadState: 깨진 JSON → 기본', () => {
  assert.equal(L.loadState(mem({ [L.KEY]: '{oops' })).v, 2);
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
  assertLoose.deepEqual(d.items[0], { text: '', done: false, tag: null });
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

console.log(`\n${n} tests passed`);
