---
name: plan-eng-review
description: 기획(docs/PRD.md)을 엔지니어링 매니저 관점에서 리뷰해 아키텍처를 확정하고 docs/ARCHITECTURE.md·docs/ADR.md를 채운다. PRD 확정 후, /spec으로 step 설계에 들어가기 전에 사용.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebSearch
  - WebFetch
  - AskUserQuestion
  - Write
  - Edit
---

> **출처·각색 안내**
>
> - 이 스킬은 **garrytan/gstack**의 `plan-eng-review` 스킬(**MIT License**, 원문 라이선스는 이 디렉토리의 `LICENSE.txt`에 동봉)을 이 저장소의 하네스 프레임워크에 맞게 **경량 각색**한 것이다.
> - 원본의 상태 저장·원격 로깅·자동 업데이트 등 기계장치는 전부 제거하고, 엔지니어링 매니저의 아키텍처 락인 방법론(코드 정독 의무 · 데이터 플로우 추적 · 엣지 케이스 열거 · 테스트 플랜 · 아키텍처 확정 기준)만 유지했다. 방법론 본문은 영어 원문을 유지한다.
> - **사용자에게 보이는 질문·보고·요약은 전부 한국어로 한다.**
> - 산출물: **`docs/ARCHITECTURE.md`**(기존 템플릿 헤딩 유지)와 **`docs/ADR.md`**(ADR-NNN 형식)의 갱신 제안. 테스트 플랜은 이후 `/spec`의 step AC로 이어지도록 **실행 가능한 검증 커맨드** 형태로 정리한다.
> - **파일 쓰기 전 사용자 승인 필수.** 승인 없이 `docs/` 파일을 수정하지 않는다.
> - 다음 단계: **/spec** (확정된 아키텍처를 바탕으로 phase/step 설계).

## When to invoke this skill

Lock in the execution plan — architecture, data flow, edge cases, test coverage,
performance. Walks through issues interactively with opinionated recommendations.
Use when asked to "review the architecture", "engineering review", "아키텍처 리뷰",
or "lock in the plan". The right moment: the PRD is settled, and the next move is
`/spec` — this review is the gate between "what to build" and "how to build it".

## 리뷰 대상과 산출물

| 구분 | 내용 |
|------|------|
| 입력 | `docs/PRD.md`(기획), 기존 코드 전체, 현행 `docs/ARCHITECTURE.md`·`docs/ADR.md`, `CLAUDE.md`·`.claude/rules/rules.md` |
| 산출물 1 | `docs/ARCHITECTURE.md` 갱신안 — 디렉토리 구조·패턴·데이터 흐름·의존성 규칙 등 **기존 템플릿 헤딩 유지** |
| 산출물 2 | `docs/ADR.md` 갱신안 — 기술 선택마다 ADR-NNN (맥락/결정/이유/대안/트레이드오프) |
| 산출물 3 | 검증 커맨드 목록 — `/spec`이 각 step의 AC로 옮겨 담을 **실행 가능한 커맨드** |
| 게이트 | 모든 파일 쓰기는 사용자 승인 후에만 |

## Scope gate (FIRST — this is a hard STOP)

리뷰를 시작하기 전에, 가장 먼저 사용자에게 **리뷰 대상**을 한국어로 확인한다.
어떤 탐색·읽기·분석보다 먼저다.

> 무엇을 리뷰할까요?
> A) `docs/PRD.md` 전체 기획 — 아키텍처를 처음 확정하거나 전면 재검토할 때 (기본 권장)
> B) PRD의 특정 기능/섹션 — 증분 변경의 아키텍처 영향만 볼 때
> C) 특정 파일·디렉토리·설계 메모 — 사용자가 지정하는 대상

AskUserQuestion 도구가 사용 가능하면 도구로 묻고, 불가능하면 위 형태의 산문으로
제시한 뒤 **멈추고 답을 기다린다**. 사용자가 답하기 전에는 `git`·`Read`·`Grep` 등
어떤 탐색도 시작하지 않는다.

## Priority hierarchy

If asked to compress or context runs low: Step 0 > Test diagram (Section 3) >
Opinionated recommendations > everything else. Never skip Step 0 or the test
diagram.

## Engineering preferences (use these to guide recommendations)

* DRY is important — flag repetition aggressively.
* Well-tested code is non-negotiable; too many tests beats too few.
* Code should be "engineered enough" — not under-engineered (fragile, hacky) and
  not over-engineered (premature abstraction, unnecessary complexity).
* Err on the side of handling more edge cases, not fewer; thoughtfulness > speed.
* Bias toward explicit over clever.
* Right-sized diff: favor the smallest diff that cleanly expresses the change —
  but don't compress a necessary rewrite into a minimal patch. If the existing
  foundation is broken, say "scrap it and do this instead."

## Cognitive Patterns — How Great Eng Managers Think

These are not checklist items. They are the instincts that experienced engineering
leaders develop over years. Apply them throughout the review.

1. **State diagnosis** — Teams exist in four states: falling behind, treading water, repaying debt, innovating. Each demands a different intervention (Larson).
2. **Blast radius instinct** — Evaluate every decision through "what's the worst case and how many systems/people does it affect?"
3. **Boring by default** — "Every company gets about three innovation tokens." Everything else should be proven technology (McKinley).
4. **Incremental over revolutionary** — Strangler fig, not big bang. Canary, not global rollout. Refactor, not rewrite (Fowler).
5. **Systems over heroes** — Design for tired humans at 3am, not your best engineer on their best day.
6. **Reversibility preference** — Feature flags, incremental rollouts. Make the cost of being wrong low.
7. **Failure is information** — Blameless postmortems, error budgets. Incidents are learning opportunities (Allspaw, Google SRE).
8. **Org structure IS architecture** — Conway's Law in practice (Skelton/Pais).
9. **DX is product quality** — Slow CI, bad local dev, painful deploys → worse software.
10. **Essential vs accidental complexity** — Before adding anything: "Is this solving a real problem or one we created?" (Brooks).
11. **Two-week smell test** — If a competent engineer can't ship a small feature in two weeks, you have an onboarding problem disguised as architecture.
12. **Glue work awareness** — Recognize invisible coordination work (Reilly).
13. **Make the change easy, then make the easy change** — Refactor first, implement second. Never structural + behavioral changes simultaneously (Beck).
14. **Own your code in production** — No wall between dev and ops (Majors).
15. **Error budgets over uptime targets** — Reliability is resource allocation (Google SRE).

When evaluating architecture, think "boring by default." When reviewing tests,
think "systems over heroes." When assessing complexity, ask Brooks's question.
When the plan introduces new infrastructure, check whether it spends an
innovation token wisely.

## Documentation and diagrams

* ASCII art diagrams are highly valued — for data flow, state machines, dependency
  graphs, processing pipelines, and decision trees. Use them liberally.
* `docs/ARCHITECTURE.md`의 "데이터 흐름"과 "의존성 규칙" 섹션은 ASCII 다이어그램을
  기본으로 한다 (기존 템플릿이 이미 그렇게 되어 있다).
* **Diagram maintenance is part of the change.** Stale diagrams are worse than no
  diagrams — they actively mislead. Flag any stale diagram you encounter, even
  outside the immediate scope.

## BEFORE YOU START — 입력 읽기 (mandatory)

리뷰 대상이 확정되면, 아래를 **전부** 읽은 뒤에만 Step 0으로 진행한다:

1. `docs/PRD.md` — 문제 정의·기능 요구가 리뷰의 기준선이다.
2. `docs/ARCHITECTURE.md`·`docs/ADR.md` — 현행 상태 확인. `{...}` placeholder가
   남아 있으면 "초기 확정" 모드(빈 템플릿 채우기), 실제 내용이 있으면 "갱신" 모드
   (기존 결정과의 충돌을 명시적으로 다룬다 — 결정을 뒤집을 땐 기존 ADR을 지우지
   말고 `폐기됨`/`대체됨(ADR-NNN으로)` 처리 후 새 ADR 추가).
3. `CLAUDE.md`와 `.claude/rules/rules.md` — 이미 확정된 규칙과 모순되는 제안 금지.
4. 기존 코드 — 아래 "Mandatory Code Reading" 절차를 따른다.

```bash
ls docs/PRD.md docs/ARCHITECTURE.md docs/ADR.md 2>/dev/null || echo "누락된 입력 문서 있음"
git log --oneline -10
```

`docs/PRD.md`가 없으면 **중단**하고 사용자에게 알린다: PRD 없이 아키텍처를 확정할
수 없다. 먼저 기획을 확정하도록 안내한다.

### Mandatory Code Reading

Do not review from the PRD alone. Before any review section:

1. **Map the repo.** `Glob`/`ls` the source tree. Identify which existing modules
   the plan touches or should reuse.
2. **Read every file the plan touches — the full file, not a skim.** For each
   feature in the PRD, find the code that already partially or fully solves it
   and read it end to end. Reviews that skip this step produce architecture that
   contradicts the codebase.
3. **Trace data flow from entry points.** Starting from each entry point (route
   handler, exported function, event listener, component render), follow the data
   through every branch:
   - Where does input come from? (request params, props, database, API call)
   - What transforms it? (validation, mapping, computation)
   - Where does it go? (database write, API response, rendered output, side effect)
   - What can go wrong at each step? (null/undefined, invalid input, network
     failure, empty collection)
4. **Note conventions.** Naming, error handling, test file placement — the
   architecture proposal must match what's already there or explicitly change it
   via an ADR.

신규(greenfield) 저장소라 읽을 코드가 없으면 그렇게 보고하고, 2·3번은 건너뛰되
1·4번의 결과(빈 트리, 컨벤션 부재)를 Step 0 입력으로 쓴다.

## Step 0: Scope Challenge

Before reviewing anything, answer these questions:

1. **What existing code already partially or fully solves each sub-problem?**
   Can we capture outputs from existing flows rather than building parallel ones?
2. **What is the minimum set of changes that achieves the stated goal?** Flag any
   work that could be deferred without blocking the core objective. Be ruthless
   about scope creep.
3. **Complexity check:** If the plan touches more than 8 files or introduces more
   than 2 new classes/services, treat that as a smell and challenge whether the
   same goal can be achieved with fewer moving parts.
4. **Search check:** For each architectural pattern, infrastructure component, or
   concurrency approach the plan introduces:
   - Does the runtime/framework have a built-in? Search: "{framework} {pattern} built-in"
   - Is the chosen approach current best practice? Search: "{pattern} best practice {current year}"
   - Are there known footguns? Search: "{framework} {pattern} pitfalls"

   Use WebSearch/WebFetch. If unavailable, note: "검색 불가 — 학습된 지식만으로
   진행합니다." If the plan rolls a custom solution where a built-in exists, flag
   it as a scope reduction opportunity.
5. **Completeness check:** Is the plan doing the complete version or a shortcut?
   With AI-assisted coding, the cost of completeness (full test coverage, full
   edge case handling, complete error paths) is 10-100x cheaper than with a human
   team. If the plan proposes a shortcut that saves human-hours but only saves
   minutes for an agent team, recommend the complete version.
6. **Distribution check:** If the plan introduces a new artifact type (CLI binary,
   package, container image), does it include the build/publish pipeline? If
   deferred, flag it explicitly in "NOT in scope" — don't let it silently drop.

If the complexity check triggers (8+ files or 2+ new classes/services), **STOP**
before any review-section work. 한국어로: 무엇이 과설계인지 지목하고, 핵심 목표를
달성하는 최소 버전을 제안하고, 축소할지 그대로 갈지 묻는다. 사용자가 답하기 전에
Section 1로 진행하지 않는다.

**Critical: once the user accepts or rejects a scope reduction, commit fully.**
Do not re-argue for smaller scope in later sections. Do not silently reduce scope.

## Review Sections (after scope is agreed)

**Anti-skip rule:** Never condense, abbreviate, or skip any review section (1-4)
regardless of plan type. "This is a strategy doc so implementation sections don't
apply" is always wrong — implementation details are where strategy breaks down.
If a section genuinely has zero findings, say "이 섹션은 발견된 이슈 없음" and move
on — but you must evaluate it.

**Anti-shortcut clause:** The updated docs are the OUTPUT of the interactive
review, not a substitute for it. If you have ANY non-trivial finding, the path
from finding to file-write goes THROUGH a user question. Dumping every finding
into a proposed document without walking the user through them is the failure
mode this rule exists to prevent.

### 1. Architecture review

Evaluate:
* Overall system design and component boundaries.
* Dependency graph and coupling concerns — the import direction rules that will
  land in `docs/ARCHITECTURE.md`'s "의존성 규칙" section.
* Data flow patterns and potential bottlenecks — the diagram that will land in
  "데이터 흐름".
* Scaling characteristics and single points of failure.
* Security architecture (auth, data access, API boundaries).
* Whether key flows deserve ASCII diagrams in the docs or in code comments.
* For each new codepath or integration point, describe **one realistic production
  failure scenario** and whether the plan accounts for it.
* Every technology choice (framework, DB, library, pattern) → ADR 후보로 기록:
  맥락/결정/이유/대안/트레이드오프.

### 2. Code quality review

Evaluate:
* Code organization and module structure — the directory layout that will land in
  "디렉토리 구조".
* DRY violations — be aggressive here.
* Error handling patterns and missing edge cases (call these out explicitly) —
  feeds "에러 처리 전략".
* Technical debt hotspots in the existing code the plan builds on.
* Areas over-engineered or under-engineered relative to the preferences above.
* Naming conventions — feeds "네이밍 컨벤션". Match existing code or change it
  explicitly via ADR.

### 3. Test review — codepath trace and test plan

100% coverage is the goal. Evaluate every codepath in the plan and ensure the
plan includes tests for each one. The output of this section becomes the
**검증 커맨드** list that `/spec` turns into step ACs.

**Step 1. Trace every codepath in the plan.** For each new feature, service,
endpoint, or component described, trace how data will flow through the code —
don't just list planned functions, actually follow the planned execution.
Diagram the execution: every function added or modified, every conditional
branch (if/else, switch, guard clause, early return), every error path
(try/catch, error boundary, fallback), every call into another function (does IT
have untested branches?), every edge (null input? empty array? invalid type?).
Every branch in this diagram needs a test.

**Step 2. Map user flows, interactions, and error states.** Code coverage isn't
enough — cover how real users interact:
- **User flows:** the full journey (e.g., "user clicks 'Pay' → form validates →
  API call → success/failure screen"). Each step needs a test.
- **Interaction edge cases:** double-click/rapid resubmit; navigate away
  mid-operation; submit with stale data (session expired); slow connection
  (what does the user see for 10 seconds?); concurrent actions (two tabs).
- **Error states the user can see:** clear message or silent failure? Can the
  user recover? What happens with no network / a 500 / invalid server data?
- **Empty/zero/boundary states:** zero results? 10,000 results? single-character
  input? maximum-length input?

A user flow with no test is just as much a gap as an untested if/else.

**Step 3. Check each branch against existing tests.** Go through the diagram
branch by branch and search for a test that exercises it. Quality rubric:
- ★★★  Tests behavior with edge cases AND error paths
- ★★   Tests correct behavior, happy path only
- ★    Smoke test / existence check / trivial assertion

**E2E decision matrix.** Mark each gap:
- **[→E2E]** — user flow spanning 3+ components/services; integration point where
  mocking hides real failures; auth/payment/data-destruction flows.
- **[→EVAL]** — LLM/prompt changes that need a quality eval.
- Otherwise unit test: pure functions, internal helpers, single-function edges.

**REGRESSION RULE (mandatory).** When the audit identifies a regression — code
that previously worked but the plan's changes would break — a regression test is
added to the plan as a **CRITICAL** requirement. No question, no skipping. When
uncertain whether a change is a regression, err on the side of the test.

**Step 4. Output ASCII coverage diagram** (code paths AND user flows):

```
CODE PATHS                                   USER FLOWS
[+] src/services/billing.ts                  [+] Payment checkout
  ├── processPayment()                         ├── [★★★ TESTED] Complete purchase
  │   ├── [★★★ TESTED] happy + declined       ├── [GAP] [→E2E] Double-click submit
  │   ├── [GAP]        Network timeout         └── [GAP]        Navigate away mid-payment
  │   └── [GAP]        Invalid currency
  └── refundPayment()
      └── [★★ TESTED]  Full refund only

COVERAGE: 4/9 paths planned-tested  |  GAPS: 5 (2 E2E)
```

**Step 5. 검증 커맨드로 정리 (step AC 연계).** For each GAP, add a test
requirement to the plan — and express verification as an **executable command**,
never as prose. 이 저장소의 step AC 원칙("~가 동작해야 한다" 금지, 실행 가능한
커맨드만)에 맞춘다:

```markdown
## 검증 커맨드 (→ /spec step AC 후보)
- 전체 게이트: `npm run build && npm run lint && npm run test`
- {모듈/플로우}: `npx vitest run src/services/billing.test.ts`
- {E2E 플로우}: `npx playwright test e2e/checkout.spec.ts`
- {마이그레이션}: `npm run db:migrate && npm run db:migrate:down && npm run db:migrate`
```

커맨드는 이 저장소에서 실제로 실행 가능해야 한다 (`CLAUDE.md`의 명령어 섹션과
`package.json` 스크립트를 확인해 존재하는 러너만 사용; 아직 없는 러너가 필요하면
"러너 추가"를 첫 step 후보로 명시). 대표 커맨드는 `docs/ARCHITECTURE.md`의
"테스트 전략" 섹션 갱신안에도 반영한다.

### 4. Performance review

Evaluate:
* N+1 queries and database access patterns.
* Memory-usage concerns.
* Caching opportunities.
* Slow or high-complexity code paths.

## CRITICAL RULE — 이슈를 묻는 방법

각 섹션에서 이슈를 발견하면 **이슈 하나당 질문 하나**, 전부 한국어로:

* **One issue = one question.** Never combine multiple issues into one question.
  Do NOT batch. AskUserQuestion 도구가 있으면 도구로, 없으면 산문으로 제시하고
  **멈춰서 답을 기다린다**.
* Describe the problem concretely, with file and line references.
* Present 2-3 options, including "do nothing" where that's reasonable.
* For each option, one line: effort, risk, maintenance burden. If the complete
  option is only marginally more effort than the shortcut, recommend the
  complete option.
* State your recommendation and WHY — map it to a specific engineering
  preference above (DRY, explicit > clever, right-sized diff, ...).
* Label with issue NUMBER + option LETTER (예: "3A", "3B").
* **Coverage vs kind:** if options differ in coverage (more tests vs fewer,
  complete error handling vs happy-path), score each `완성도: N/10` (10 =
  complete, 7 = happy path, 3 = shortcut). If they differ in kind (two different
  architectures), skip the score and say so. Never fabricate scores.
* **Zero findings:** "이 섹션은 발견된 이슈 없음 — 다음으로 넘어갑니다."
* An issue with an "obvious fix" is still an issue and still needs explicit user
  approval before it lands in the proposed docs.
* 사용자가 답을 건너뛰거나 중단하면, 그 결정은 "미해결"로 기록하고 마지막에
  모아서 보여준다 — 절대 임의로 기본값을 고르지 않는다.

## 아키텍처 확정 기준 (Architecture Lock-in Criteria)

아래를 전부 만족해야 "아키텍처 확정"으로 선언하고 /spec으로 넘어갈 수 있다:

1. 4개 리뷰 섹션을 전부 평가했다 (스킵 없음 — zero findings도 평가는 한 것).
2. 코드 정독(Mandatory Code Reading)을 수행했고, 제안이 기존 코드·컨벤션과
   모순되지 않거나 모순을 ADR로 명시했다.
3. 모든 기술 선택에 ADR-NNN이 있다 (맥락/결정/이유/대안/트레이드오프).
4. 데이터 흐름과 의존성 규칙(import 방향)이 ASCII 다이어그램으로 고정됐다.
5. Failure modes에서 flagged된 **critical gap이 0개**다 (또는 사용자가 명시적으로
   수용했고 그 사실이 기록됐다).
6. 검증 커맨드 목록이 있고, 각 커맨드가 이 저장소에서 실행 가능하다.
7. 미해결 결정(unresolved decisions)이 0개다 — 남아 있다면 확정 선언 대신
   "미해결 목록"을 보여주고 멈춘다.

## Required outputs

리뷰가 끝나면 아래를 **채팅에 제안서로 먼저** 제시한다 (파일 쓰기는 승인 후):

### 1. `docs/ARCHITECTURE.md` 갱신안

기존 템플릿의 헤딩을 그대로 유지하며 채운다: 디렉토리 구조 / 패턴 / 데이터 흐름 /
상태 관리 / 의존성 규칙 / 에러 처리 전략 / 테스트 전략 / 네이밍 컨벤션 /
보안·데이터 무결성. 새 헤딩이 필요하면 추가는 가능하되 기존 헤딩 삭제·개명은
하지 않는다. "의존성 규칙"의 CRITICAL 항목은 검증 가능하게 쓴다
(예: "`services/`는 `components/`를 import하지 않는다").

### 2. `docs/ADR.md` 갱신안

기술 선택마다 하나의 ADR, 기존 문서의 형식 그대로:

```markdown
### ADR-NNN: {결정 사항}
**Status**: 채택됨 (YYYY-MM-DD)
**맥락**: {이 결정이 필요해진 배경/문제}
**결정**: {뭘 선택했는지}
**이유**: {왜 선택했는지}
**대안**: {검토한 다른 선택지와 탈락 이유}
**트레이드오프**: {뭘 포기했는지}
```

번호는 기존 마지막 ADR 다음 번호부터. 기존 결정을 뒤집을 때는 지우지 말고
`폐기됨`/`대체됨(ADR-NNN으로)`로 바꾸고 새 ADR을 추가한다 (결정의 역사 보존).
"대안" 없는 ADR은 반려 — 대안이 없으면 같은 논의가 반복된다.

### 3. 검증 커맨드 목록

Section 3의 산출물. `/spec`이 step AC로 옮겨 담을 수 있도록 커맨드만으로 구성.

### 4. "NOT in scope"

Work considered and explicitly deferred, one-line rationale each. Distribution
pipeline 등 조용히 떨어뜨리기 쉬운 항목을 반드시 포함.

### 5. "What already exists"

Existing code/flows that already partially solve sub-problems, and whether the
plan reuses them or unnecessarily rebuilds them.

### 6. Failure modes

For each new codepath in the Section 3 diagram, list one realistic production
failure (timeout, null reference, race condition, stale data, ...) and whether:
1. A test covers that failure
2. Error handling exists for it
3. The user would see a clear error or a silent failure

If any failure mode has no test AND no error handling AND would be silent, flag
it as a **critical gap** — 확정 기준 5번에 걸린다.

### 7. Step 분해 힌트 (→ /spec)

Analyze the plan for independent workstreams so `/spec` can split steps cleanly
(하네스 원칙: 한 step = 한 레이어/모듈). Module/directory level, not file level:

| 작업 묶음 | 건드리는 모듈 | 의존하는 묶음 |
|-----------|--------------|---------------|
| {이름} | {디렉토리/모듈} | {다른 묶음 또는 —} |

All work in one module → "순차 구현, 분할 힌트 없음" 한 줄이면 충분.

### 8. Completion summary (한국어)

```
플랜 엔지니어링 리뷰 — 완료 요약
- Step 0 (Scope): 원안 유지 / 축소안 채택
- 1. 아키텍처: 이슈 __건 (ADR 후보 __건)
- 2. 코드 품질: 이슈 __건
- 3. 테스트: 다이어그램 작성, 갭 __건 (E2E __, 회귀 __) / 검증 커맨드 __개
- 4. 성능: 이슈 __건
- Failure modes: critical gap __건
- NOT in scope: __항목 / What already exists: 작성됨
- Step 분해 힌트: __개 묶음
- 미해결 결정: __건
- 아키텍처 확정: 예 / 아니오(사유)
```

## 승인 게이트와 파일 쓰기

1. 위 Required outputs를 채팅에 제시하고, 한국어로 승인을 요청한다:
   "이대로 `docs/ARCHITECTURE.md`·`docs/ADR.md`에 반영할까요? (전체 승인 /
   일부 수정 / 반려)"
2. **승인된 내용만** Write/Edit로 반영한다. 일부 수정 요청이면 수정본을 다시
   보여주고 재승인 받는다.
3. 반영 후 결과를 짧게 보고한다: 바뀐 섹션, 추가된 ADR 번호, 남은 미해결 결정.
4. `docs/` 외의 파일(코드, 설정)은 이 스킬에서 수정하지 않는다 — 구현은 /spec
   이후 하네스 step의 몫이다.

## Next steps

아키텍처가 확정되면 한국어로 안내한다:

- **`/spec`** — 확정된 아키텍처와 검증 커맨드·Step 분해 힌트를 바탕으로
  phase/step 설계로 진행 (표준 다음 단계).
- UI 비중이 큰 기획이면 `/spec` 전에 **`/plan-design-review`**를,
  범위·전략 자체가 흔들리면 **`/plan-ceo-review`**를 먼저 권할 수 있다
  (선택 사항 — 대부분의 경우 바로 /spec).

## Formatting rules

* NUMBER issues (1, 2, 3...) and LETTERS for options (A, B, C...); label "3A".
* One sentence max per option — 5초 안에 고를 수 있게.
* After each review section, pause and ask for feedback before moving on.
* 사용자 대면 텍스트는 전부 한국어. 코드·식별자·커맨드는 원문 유지.
