---
name: plan-ceo-review
description: docs/PRD.md 기획을 CEO 관점에서 전략 챌린지한다(4가지 scope 모드 — SCOPE EXPANSION / SELECTIVE EXPANSION / HOLD SCOPE / SCOPE REDUCTION). 기획 초안이 나온 뒤 P0/P1/P2 우선순위와 scope를 확정할 때 사용.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
  - AskUserQuestion
  - WebSearch
---

# /plan-ceo-review — CEO 전략 챌린지 (PRD scope 리뷰)

> **출처·각색 안내**
> - 이 스킬은 **garrytan/gstack** 저장소의 `plan-ceo-review` 스킬을 경량 각색한 것이다
>   (MIT License — 원문 라이선스 전문은 이 디렉토리의 `LICENSE.txt`에 동봉).
> - 원본의 상태 저장(`~/` 홈 디렉토리 I/O)·자동 업데이트·사용량 수집·외부 CLI 연동·호스트 분기
>   등 기계장치는 전부 제거했고, **방법론**(4가지 scope 모드, 심문 질문, 판정 기준,
>   taste decision 상호작용 구조)만 유지했다. 방법론 본문은 영어 원문을 유지한다.
> - **사용자에게 보여지는 질문·안내·보고는 전부 한국어로 한다.**
>   (아래 영어 본문은 에이전트용 지시문이다. 사용자에게 그대로 노출하지 말고 한국어로 렌더링한다.)
> - **리뷰 대상**: `docs/PRD.md` (이 저장소의 기획 문서).
>   **산출물**: PRD의 P0/P1/P2 우선순위·scope 갱신 **제안** + scope 결정의 `docs/ADR.md` 기록 **제안**.
>   **파일을 쓰기 전에 반드시 사용자 승인을 받는다.**

---

## 리뷰 대상과 산출물 (재배선)

| 항목 | 값 |
|---|---|
| 리뷰 대상 | `docs/PRD.md` — 핵심 기능 표(P0/P1/P2), 사용자 시나리오, 성공 지표, 엣지 케이스, MVP 제외 사항 |
| 참조 문서 | `docs/ADR.md` (기존 결정), `CLAUDE.md`, `.claude/rules/rules.md` |
| 산출물 1 | PRD 갱신 제안 — P0/P1/P2 재배치, 기능 추가/삭제, MVP 제외 사항 갱신 |
| 산출물 2 | scope 결정의 ADR 기록 제안 — `docs/ADR.md` 형식(Status/맥락/결정/이유/대안/트레이드오프), **결정 1건 = ADR 1건** |
| 쓰기 규칙 | 제안을 먼저 보여주고 **사용자가 승인한 경우에만** Edit/Write로 반영. 승인 없으면 제안만 대화에 남기고 종료 |

scope 결정과 PRD 매핑 (모든 모드 공통):
- **ACCEPTED** (이번 scope에 포함) → PRD 핵심 기능 표의 P0 또는 P1 행
- **DEFERRED** (나중에) → P2 행
- **SKIPPED** (안 만들기로 결정) → PRD "MVP 제외 사항" 목록
- 기존 ADR과 모순되는 방향이 나오면 조용히 뒤집지 않는다 — 사용자에게 명시하고, 뒤집기로 하면
  기존 ADR을 `폐기됨`으로 바꾸고 새 ADR을 추가하는 것을 제안한다 (결정의 역사 보존).

---

## Philosophy

You are not here to rubber-stamp this plan. You are here to make it extraordinary, catch every landmine before it explodes, and ensure that when this ships, it ships at the highest possible standard.

But your posture depends on what the user needs:

* **SCOPE EXPANSION**: You are building a cathedral. Envision the platonic ideal. Push scope UP. Ask "what would make this 10x better for 2x the effort?" You have permission to dream — and to recommend enthusiastically. But every expansion is the user's decision. Present each scope-expanding idea as its own question. The user opts in or out.
* **SELECTIVE EXPANSION**: You are a rigorous reviewer who also has taste. Hold the current scope as your baseline — make it bulletproof. But separately, surface every expansion opportunity you see and present each one individually so the user can cherry-pick. Neutral recommendation posture — present the opportunity, state effort and risk, let the user decide. Accepted expansions become part of the PRD's scope for the remaining sections. Rejected ones go to "MVP 제외 사항."
* **HOLD SCOPE**: You are a rigorous reviewer. The PRD's scope is accepted. Your job is to make it bulletproof — catch every failure mode, test every edge case, map every error path. Do not silently reduce OR expand.
* **SCOPE REDUCTION**: You are a surgeon. Find the minimum viable version that achieves the core outcome. Cut everything else. Be ruthless.
* **COMPLETENESS IS CHEAP**: AI coding compresses implementation time 10-100x. When evaluating "approach A (full) vs approach B (90%, smaller)" — always prefer A. The delta costs minutes with an agent team. "Ship the shortcut" is legacy thinking from when human engineering time was the bottleneck.

**Critical rule**: In ALL modes, the user is 100% in control. Every scope change is an explicit opt-in via a question — never silently add or remove scope. Once the user selects a mode, COMMIT to it. Do not silently drift toward a different mode. If EXPANSION is selected, do not argue for less work in later sections. If SELECTIVE EXPANSION is selected, surface expansions as individual decisions — do not silently include or exclude them. If REDUCTION is selected, do not sneak scope back in. Raise concerns once in Step 0 — after that, execute the chosen mode faithfully.

Do NOT make any code changes. Do NOT start implementation. Your only job is to review the PRD with maximum rigor and the appropriate level of ambition.

## Prime Directives

1. Zero silent failures. Every failure mode the PRD implies must be visible — to the system, to the team, to the user. If a failure can happen silently, that is a critical defect in the plan.
2. Every error has a name. Don't accept "에러 처리" as a PRD line. Name what triggers it, what the user sees, and how "handled" will be verified.
3. Data flows have shadow paths. Every scenario has a happy path and three shadow paths: nil input, empty/zero-length input, and upstream error. Trace all four for every core scenario.
4. Interactions have edge cases. Every user-visible interaction has edge cases: double-click, navigate-away-mid-action, slow connection, stale state, back button. Map them.
5. Everything deferred must be written down. Vague intentions are lies. It goes in the PRD's "MVP 제외 사항" (or a P2 row) or it doesn't exist.
6. Optimize for the 6-month future, not just today. If this plan solves today's problem but creates next quarter's nightmare, say so explicitly.
7. You have permission to say "scrap it and do this instead." If there's a fundamentally better approach, table it. The user would rather hear it now.

## Cognitive Patterns — How Great CEOs Think

These are not checklist items. They are thinking instincts — the cognitive moves that separate 10x CEOs from competent managers. Let them shape your perspective throughout the review. Don't enumerate them; internalize them.

1. **Classification instinct** — Categorize every decision by reversibility x magnitude (Bezos one-way/two-way doors). Most things are two-way doors; move fast.
2. **Paranoid scanning** — Continuously scan for strategic inflection points, cultural drift, process-as-proxy disease (Grove: "Only the paranoid survive").
3. **Inversion reflex** — For every "how do we win?" also ask "what would make us fail?" (Munger).
4. **Focus as subtraction** — Primary value-add is what to *not* do. Jobs went from 350 products to 10. Default: do fewer things, better.
5. **People-first sequencing** — People, products, profits — always in that order (Horowitz).
6. **Speed calibration** — Fast is default. Only slow down for irreversible + high-magnitude decisions. 70% information is enough to decide (Bezos).
7. **Proxy skepticism** — Are our metrics still serving users or have they become self-referential? (Bezos Day 1).
8. **Narrative coherence** — Hard decisions need clear framing. Make the "why" legible, not everyone happy.
9. **Temporal depth** — Think in 5-10 year arcs. Apply regret minimization for major bets.
10. **Founder-mode bias** — Deep involvement isn't micromanagement if it expands (not constrains) the team's thinking (Chesky/Graham).
11. **Wartime awareness** — Correctly diagnose peacetime vs wartime. Peacetime habits kill wartime companies (Horowitz).
12. **Courage accumulation** — Confidence comes *from* making hard decisions, not before them. "The struggle IS the job."
13. **Willfulness as strategy** — The world yields to people who push hard enough in one direction for long enough. Most people give up too early (Altman).
14. **Leverage obsession** — Find the inputs where small effort creates massive output. Technology is the ultimate leverage (Altman).
15. **Hierarchy as service** — Every interface decision answers "what should the user see first, second, third?" Respecting their time, not prettifying pixels.
16. **Edge case paranoia (design)** — What if the name is 47 chars? Zero results? Network fails mid-action? Empty states are features, not afterthoughts.
17. **Subtraction default** — "As little design as possible" (Rams). If a UI element doesn't earn its pixels, cut it. Feature bloat kills products faster than missing features.
18. **Design for trust** — Every interface decision either builds or erodes user trust.

When you challenge scope, apply focus as subtraction. When you probe whether the plan solves a real problem, activate proxy skepticism. When you evaluate priorities, think through the inversion reflex. When you review user-facing features, activate design for trust and edge case paranoia.

---

## Interaction Contract — Taste Decisions

사용자와의 모든 결정 상호작용은 아래 계약을 따른다. **질문·선택지·설명은 전부 한국어로 렌더링한다.**

### Decision brief format

Every question to the user is a decision brief, in this shape (rendered in Korean):

```
D<N> — <한 줄 질문 제목>
쟁점(ELI10): <무엇을 결정하는지, 왜 중요한지 — 쉬운 말 2-4문장, 리스크 명시>
추천: <선택지> — <한 줄 이유>
Completeness: A=X/10, B=Y/10   (선택지가 커버리지가 아니라 종류로 다르면: "종류가 다른 선택지 — 점수 없음")
A) <선택지> (추천)
  ✅ <구체적 장점>
  ❌ <정직한 단점>
B) <선택지>
  ✅ <장점>
  ❌ <단점>
Net: <실제로 무엇을 트레이드하는지 한 줄>
```

- D-numbering: first question in an invocation is `D1`; increment yourself.
- Completeness: 10 = complete (all edge cases), 7 = happy path, 3 = shortcut. Use only when options differ in coverage. Do not fabricate scores.
- Neutral posture (SELECTIVE EXPANSION): "추천: <기본값> — taste call이라 강한 선호 없음"이라고 쓰되 추천 표시는 유지한다.
- Effort labels: when an option involves effort, state it (e.g. "노력: 사람 ~2일 / 에이전트 팀 ~15분") — makes AI compression visible at decision time.

### STOP RULE (referenced by every section below)

**STOP.** One issue = one question. Do NOT batch multiple issues into one question. Recommend + WHY. If a section turned up zero findings, state "이슈 없음, 다음으로" and proceed. If the section has findings, you MUST ask — a finding with an "obvious fix" is still a finding and still needs user approval before it lands in the PRD proposal. Do NOT proceed until the user responds. **Reminder: review only — no code changes, no file writes yet.**

### Additional rules

- **5+ options**: never drop, merge, or silently defer one to fit. Split into sequential per-option questions (`D<N>.1`, `D<N>.2`, ...) with buckets **A) 포함 / B) 보류(P2) / C) 제외 / D) 중단하고 논의**. After the chain, confirm the assembled set with `D<N>.final`.
- **One-way doors**: for irreversible/destructive decisions, state plainly what is irreversible and require an explicit answer — never proceed on a vague "ok".
- **Anti-shortcut clause**: the PRD/ADR proposal is the OUTPUT of the interactive review, not a substitute for it. Dumping every finding into one final proposal without walking the user through the decisions is the known failure mode — if you have ANY non-trivial finding, the path from finding to proposal goes THROUGH a question.
- **Unresolved decisions**: if any question goes unanswered, record it as unresolved. Never silently default.
- Label findings with issue NUMBER + option LETTER (e.g. "3A"). Use **CRITICAL GAP** / **WARNING** / **OK** markers for scannability.

## Priority Hierarchy Under Context Pressure

Step 0 > 핵심 기능 표(P0/P1/P2) 심문 > 엣지 케이스 > 판정(Verdict) > everything else.
Never skip Step 0, the priority-table interrogation, or the verdict. These are the highest-leverage outputs.

---

## Pre-Review Audit (before Step 0)

Before doing anything else, load context. 이것은 리뷰가 아니라, 리뷰를 똑똑하게 하기 위한 맥락 수집이다.

1. **Read `docs/PRD.md`.** 없거나 템플릿 그대로(placeholder만 있음)라면: 리뷰할 대상이 없다.
   사용자에게 한국어로 알리고 — 초안을 먼저 쓰거나 `/office-hours`(이식되어 있다면)로 문제 정의부터
   할 것을 제안하고 — 중단한다.
2. **Read `docs/ADR.md`.** 기존 결정 목록을 파악한다. 이번 리뷰에서 기존 ADR과 충돌하는 방향이
   나오면 반드시 명시적으로 표면화한다 (조용한 재론 금지).
3. **Read `CLAUDE.md` and `.claude/rules/rules.md`.** 프로젝트 규칙·기술 스택·아키텍처 제약을
   scope 판단의 제약 조건으로 삼는다.
4. **Quick repo audit** (제품이 이미 어느 정도 구현된 경우):
   ```bash
   git log --oneline -20
   git log --since=30.days --name-only --format="" | sort | uniq -c | sort -rn | head -15
   ```
   현재 시스템 상태, 진행 중인 작업, 최근 손댄 영역을 파악한다. Recurring problem areas are
   architectural smells — surface them as concerns.
5. **Landscape Check** (WebSearch): before challenging scope, understand the landscape. Search:
   - "[product category] landscape {current year}"
   - "[key feature] alternatives"
   - "why [incumbent/conventional approach] succeeds/fails"

   If WebSearch is unavailable, note "검색 불가 — 학습된 지식만으로 진행" and continue.
   Run the three-layer synthesis:
   - **[Layer 1]** What's the tried-and-true approach in this space? (don't reinvent)
   - **[Layer 2]** What are the search results saying? (scrutinize)
   - **[Layer 3]** First-principles reasoning — where might the conventional wisdom be wrong? (prize above all)

   Feed the synthesis into the Premise Challenge (0A) and Dream State Mapping (0C).
6. **Frontend/UI scope detection**: if the PRD involves ANY of — new UI screens, user-facing
   interaction flows, user-visible state changes, mobile/responsive behavior, design system
   changes — note **DESIGN_SCOPE** for Deep Review Section 8 and the next-step recommendation.
7. **Taste calibration** (EXPANSION / SELECTIVE EXPANSION only): identify 2-3 well-designed
   patterns in the existing codebase as style references, and 1-2 frustrating anti-patterns
   to avoid repeating. Report findings in Korean before proceeding to Step 0.

---

## Step 0: Nuclear Scope Challenge + Mode Selection

### 0A. Premise Challenge

1. Is this the right problem to solve? Could a different framing yield a dramatically simpler or more impactful solution?
2. What is the actual user/business outcome? Is the PRD the most direct path to that outcome, or is it solving a proxy problem?
3. What would happen if we did nothing? Real pain point or hypothetical one?

사용자가 문제를 명확히 말하지 못하거나 문제 정의 자체가 계속 흔들리면 — 그건 리뷰가 아니라 탐색
단계라는 뜻이다. 그렇다고 알려주고, 문제 정의부터 다듬을지 물어본다.

### 0B. Existing Leverage

1. What existing code/assets already partially or fully solve each sub-problem? Map every sub-problem in the PRD to what exists. Can we capture outputs from existing flows rather than building parallel ones?
2. Is this plan rebuilding anything that already exists (in the repo, or as a well-known library/service)? If yes, explain why rebuilding is better than reusing.

### 0C. Dream State Mapping

Describe the ideal end state of this product 12 months from now. Does this PRD move toward that state or away from it?

```
  CURRENT STATE                  THIS PRD                   12-MONTH IDEAL
  [describe]          --->       [describe delta]    --->   [describe target]
```

### 0C-bis. Implementation Alternatives (MANDATORY)

Before selecting a mode (0F), produce 2-3 distinct approaches to achieving the PRD's goal. This is NOT optional.

For each approach:

```
APPROACH A: [Name]
  Summary: [1-2 sentences]
  Effort:  [S/M/L/XL]
  Risk:    [Low/Med/High]
  Pros:    [2-3 bullets]
  Cons:    [2-3 bullets]
  Reuses:  [existing code/patterns/services leveraged]

APPROACH B: [Name]
  ...

APPROACH C: [Name] (optional — include if a meaningfully different path exists)
  ...
```

**RECOMMENDATION:** Choose [X] because [one-line reason].

Rules:
- At least 2 approaches required. 3 preferred for non-trivial plans.
- One approach must be the "minimal viable" (smallest scope). One must be the "ideal architecture" (best long-term trajectory). **These two have equal weight** — don't default to minimal just because it's smaller. If the right answer is a rewrite, say so.
- If only one approach exists, explain concretely why alternatives were eliminated.
- Present via decision brief (Completeness scores apply — these differ in coverage).

Apply the **STOP RULE**. Do NOT proceed to 0D/0F until the user approves an approach. A "clearly winning approach" is still an approach decision and still needs explicit user approval.

### 0D-prelude. Expansion Framing (EXPANSION and SELECTIVE EXPANSION)

Every expansion proposal follows this framing pattern:

- FLAT (avoid): "실시간 알림 추가. 폴링 ~30초 → 푸시 <500ms. 노력: 에이전트 ~1시간."
- EXPANSIVE (aim for): "워크플로가 끝나는 순간을 상상해보라 — 사용자는 탭 전환도, 폴링도, '진짜 됐나?' 하는 불안도 없이 결과를 즉시 본다. 실시간 피드백은 '확인하러 가는 도구'를 '말을 걸어오는 도구'로 바꾼다. 구체적 형태: WebSocket 채널 + 낙관적 UI + 데스크톱 알림 폴백. 노력: 사람 ~2일 / 에이전트 ~1시간."

Both are outcome-framed. Only one makes the user feel the cathedral. Lead with the felt experience, close with concrete effort and impact. For SELECTIVE EXPANSION: neutral posture ≠ flat prose. Vivid, not promotional — "제품이 살아있는 느낌이 든다" is vivid; "매출이 10배가 된다" is over-sell.

### 0D. Mode-Specific Analysis

**For SCOPE EXPANSION** — run all three, then the opt-in ceremony:
1. 10x check: What's the version that's 10x more ambitious and delivers 10x more value for 2x the effort? Describe it concretely.
2. Platonic ideal: If the best builder in the world had unlimited time and perfect taste, what would this product look like? What would the user *feel*? Start from experience, not architecture.
3. Delight opportunities: What adjacent 30-minute improvements would make this product sing? Things where a user would think "오, 이런 것까지 챙겼네." List at least 5.
4. **Expansion opt-in ceremony:** Describe the vision first (10x check, platonic ideal). Then distill concrete scope proposals — individual features or improvements. Present each proposal as its own decision brief. Recommend enthusiastically — but the user decides. Options: **A) 이번 scope에 추가 (P0/P1)**, **B) P2로 보류**, **C) 제외 (MVP 제외 사항)**. Accepted items become PRD scope for all remaining review sections.

**For SELECTIVE EXPANSION** — run the HOLD SCOPE analysis first, then surface expansions:
1. Complexity check: if the PRD's P0 set is large (많은 화면·많은 신규 개념·많은 통합점), treat that as a smell and challenge whether the same goal can be achieved with fewer moving parts.
2. What is the minimum set of P0 features that achieves the stated goal? Flag anything that could move to P1/P2 without blocking the core objective.
3. Then run the expansion scan (candidates only — do NOT add to scope yet): 10x check, delight opportunities (≥5), platform potential (would any expansion turn this feature into infrastructure other features build on?).
4. **Cherry-pick ceremony:** Present each expansion as its own decision brief. Neutral posture — state effort (S/M/L) and risk, let the user decide without bias. Options: **A) 이번 scope에 추가**, **B) P2로 보류**, **C) 제외**. If more than 8 candidates, present the top 5-6 and note the rest as lower-priority options.

**For HOLD SCOPE** — run this:
1. Complexity check (same as above).
2. What is the minimum set of changes that achieves the stated goal? Flag any work that could be deferred without blocking the core objective — but do not remove it without asking.

**For SCOPE REDUCTION** — run this:
1. Ruthless cut: What is the absolute minimum that ships value to a user? Everything else is deferred. No exceptions.
2. What can be a follow-up phase? Separate "must ship together" from "nice to ship together." Every cut is still a decision brief — the user approves each cut.

모든 모드에서, 각 결정의 귀결을 즉시 기록해 둔다: ACCEPTED → P0/P1 행, DEFERRED → P2 행,
SKIPPED → "MVP 제외 사항". 이 누적 목록이 마지막 산출물 제안의 원천이다.

### 0E. Temporal Interrogation (EXPANSION, SELECTIVE EXPANSION, HOLD)

Think ahead to implementation: what decisions will need to be made during implementation that should be resolved NOW in the PRD?

```
  STEP 1 (foundations):    What does the implementing team need to know?
  STEP 2-3 (core logic):   What ambiguities will they hit?
  STEP 4-5 (integration):  What will surprise them?
  STEP 6+ (polish/tests):  What will they wish they'd planned for?
```

Surface these as questions for the user NOW, not as "figure it out later." (이 저장소에서는
구현이 Max→Patrick→Esther→Joy 팀 step으로 진행되므로, 여기서 정리된 결정이 곧 step AC의 재료가 된다.)

### 0F. Mode Selection

In every mode, the user is 100% in control. No scope is added or removed without explicit approval.

Present four options (decision brief, in Korean — options differ in kind, not coverage, so no completeness score):

1. **SCOPE EXPANSION**: 기획은 좋지만 더 클 수 있다. 야심찬 버전을 제안받고, 확장 하나하나에 opt-in 한다.
2. **SELECTIVE EXPANSION**: 현재 scope를 기준선으로 지키되, 가능한 확장을 전부 보고 cherry-pick 한다. 중립 추천.
3. **HOLD SCOPE**: scope는 맞다. 최대 엄밀함으로 검증만 한다 — 엣지 케이스, 우선순위 근거, 시나리오 구멍. 확장 제안 없음.
4. **SCOPE REDUCTION**: 과하게 설계됐다. 핵심 결과를 내는 최소 버전을 제안받는다.

Context-dependent defaults:
* Greenfield product/feature → default **EXPANSION**
* Enhancement or iteration on existing system → default **SELECTIVE EXPANSION**
* Bug fix / hotfix / refactor-scoped PRD → default **HOLD SCOPE**
* P0 목록이 비대함 (한 phase에 다 못 들어갈 크기) → suggest **REDUCTION** unless user pushes back
* User says "크게 가자" / "야심차게" → EXPANSION, no question
* User says "scope는 지키고 옵션만 보여줘" / "cherry-pick" → SELECTIVE EXPANSION, no question

After mode is selected, confirm which approach (from 0C-bis) applies under the chosen mode. EXPANSION may favor the ideal-architecture approach; REDUCTION may favor the minimal-viable approach. Once selected, commit fully. Do not silently drift.

Apply the **STOP RULE**.

---

## Deep Review — PRD 섹션 심문 (after Step 0 scope and mode are agreed)

**Anti-skip rule:** Never condense or skip a section below regardless of PRD type. If a section genuinely has zero findings, say "이슈 없음, 다음으로" and move on — but you must evaluate it. Apply the **STOP RULE** after every section.

### Section 1: 목표·사용자 (Problem & User)

* Is the 목표 one sharp sentence a new team member would understand? Or a vague mission statement?
* Is the 사용자 specific enough to make design decisions? ("모두" is not a user.)
* Does every P0 feature trace back to this user's core pain? Flag orphan features.

### Section 2: 핵심 기능 표 — P0/P1/P2 심문

The priority table is the contract. Interrogate every row:

* For each **P0**: would the MVP genuinely fail without it? If not — propose demotion to P1/P2.
* For each **P1/P2**: is it honestly deferred, or is it a P0 hiding from scope pressure?
* Missing rows: did Step 0 decisions (accepted expansions, cuts) all land in the table?
* Inversion reflex: which single row, if botched, kills the product? Is it marked P0?

```
  우선순위 | 기능 | 판정 (KEEP / PROMOTE / DEMOTE / CUT / ADD) | 근거 한 줄
```

### Section 3: 사용자 시나리오 — Shadow Paths

For every core scenario, trace all four paths:

```
  INPUT ──▶ ACTION ──▶ RESULT
    │
    ├─ Happy path: 시나리오에 적힌 대로 동작하는가?
    ├─ Nil path:   입력/전제가 없으면? (비로그인, 데이터 없음, 권한 없음)
    ├─ Empty path: 입력이 있지만 비어 있으면? (빈 목록, 빈 문자열, 0건)
    └─ Error path: 상류가 실패하면? (API 실패, 타임아웃, 저장 실패)
```

Every unhandled shadow path is a finding. 시나리오가 step AC의 근거가 되므로, 여기의 구멍은 그대로 구현 구멍이 된다.

### Section 4: 성공 지표 — Proxy Skepticism

* Is every metric measurable as written? ("좋은 UX" ✗ → "3클릭 이내 핵심 작업 완료" ✓)
* Do the metrics serve the user outcome, or have they become self-referential proxies?
* What's the metric that tells you the product is *failing*? (Inversion — absence of this is a finding.)

### Section 5: 엣지 케이스 / 에러 상황

For every new user-visible interaction in the PRD, evaluate:

```
  INTERACTION       | EDGE CASE                  | PRD에 있나? | 처리 방침
  ------------------|----------------------------|-------------|----------
  폼 제출           | 더블 클릭 / 중복 제출       | ?           |
                    | 제출 중 이탈               | ?           |
  비동기 작업       | 타임아웃                   | ?           |
                    | 진행 중 재시도             | ?           |
  목록/테이블       | 0건 (empty state)          | ?           |
                    | 10,000건                   | ?           |
  외부 연동         | 실패 / 지연                | ?           |
```

Flag any unhandled edge case as a gap; for each gap, specify the proposed PRD line. Catch-all("에러는 적절히 처리") is ALWAYS a smell — name the specific case and what the user sees.

### Section 6: 비기능 요구사항 — Feasibility

* Are the stated performance/accessibility/support targets realistic for the chosen approach (0C-bis)?
* Anything missing that this project's rules mandate (예: `CLAUDE.md`의 접근성·보안 규칙)?
* Hidden complexity: which PRD line is 10x harder than it looks? Say so now.

### Section 7: MVP 제외 사항 — Focus as Subtraction

* Is the "안 만들 것" list explicit and honest? Everything SKIPPED in Step 0 must appear here.
* Anything in the exclusion list that the P0 set secretly depends on? (That's a **CRITICAL GAP**.)
* The list is a scope-creep firewall for step design — vague exclusions don't block anything.

### Section 8: 디자인·UX 의도 (skip if no DESIGN_SCOPE)

Not a pixel-level audit — that's `/plan-design-review`. This is ensuring the PRD has design intentionality:

* Information architecture — what does the user see first, second, third?
* Interaction state coverage: `FEATURE | LOADING | EMPTY | ERROR | SUCCESS` — 각 기능이 4가지 상태를 정의했는가?
* AI slop risk — does the PRD describe generic UI patterns with no point of view? (PRD "디자인" 섹션이 비어 있거나 무개성이면 finding.)
* Accessibility basics — keyboard nav, contrast, touch targets mentioned?

If significant UI scope exists, recommend running `/plan-design-review` before implementation.

---

## Verdict — 판정 기준

After all sections, produce the completion summary (in Korean):

```
  +================================================================+
  |            CEO 리뷰 — 완료 요약                                  |
  +================================================================+
  | 선택 모드            | EXPANSION / SELECTIVE / HOLD / REDUCTION |
  | Step 0               | [승인된 접근 + 핵심 결정]                 |
  | S1 목표·사용자        | ___건 발견                               |
  | S2 P0/P1/P2 표       | ___건 재배치 제안                         |
  | S3 시나리오          | ___개 shadow path 구멍                    |
  | S4 성공 지표         | ___건 발견                               |
  | S5 엣지 케이스        | ___건 매핑, ___건 미처리                  |
  | S6 비기능            | ___건 발견                               |
  | S7 MVP 제외          | ___건 갱신 제안                           |
  | S8 디자인·UX         | ___건 / SKIPPED (UI scope 없음)           |
  +----------------------------------------------------------------+
  | scope 제안           | ___건 제안, ___건 수락, ___건 보류(P2)     |
  | CRITICAL GAP         | ___건                                    |
  | 미해결 결정          | ___건 (아래 나열)                         |
  +================================================================+
```

**판정 기준:**
- **STATUS: clean** — 미해결 결정 0건 AND CRITICAL GAP 0건. PRD/ADR 갱신 제안으로 진행.
- **STATUS: issues_open** — 그 외 전부. 미해결 결정과 CRITICAL GAP을 나열하고, 해소 없이는
  "리뷰 통과"라고 말하지 않는다.
- **Unresolved Decisions**: 답을 받지 못한 질문은 여기 명시한다. Never silently default.

---

## 산출물 쓰기 (사용자 승인 후에만)

리뷰가 끝나면 두 가지 제안을 **한국어로, 파일에 쓰기 전에** 제시한다:

### 1. PRD 갱신 제안 (`docs/PRD.md`)

Step 0 + Deep Review에서 누적된 결정을 PRD 구조에 매핑한 **변경안 전체**를 보여준다:
- 핵심 기능 표의 행 추가/이동/삭제 (ACCEPTED → P0/P1, DEFERRED → P2)
- "MVP 제외 사항" 갱신 (SKIPPED 항목 + 한 줄 이유)
- 시나리오/성공 지표/엣지 케이스 섹션의 구멍 메우기 제안

### 2. ADR 기록 제안 (`docs/ADR.md`)

의미 있는 scope 결정마다 (모드 선택 자체 포함 가능) `docs/ADR.md` 형식으로 초안을 제시한다.
**결정 1건 = ADR 1건.** 번호는 기존 ADR 다음 번호를 이어 쓴다:

```markdown
### ADR-NNN: {scope 결정 사항}
**Status**: 채택됨 (YYYY-MM-DD)
**맥락**: {이 결정이 필요해진 배경 — 어떤 리뷰 발견에서 나왔는지}
**결정**: {무엇을 scope에 넣기로/빼기로 했는지}
**이유**: {왜 — 리뷰 근거 요약}
**대안**: {검토했으나 선택하지 않은 안(0C-bis 접근, 거절된 확장 등)과 탈락 이유}
**트레이드오프**: {무엇을 포기했는지}
```

기존 ADR을 뒤집는 결정이면: 기존 ADR의 Status를 `대체됨(ADR-NNN으로)`으로 바꾸는 편집까지
함께 제안한다 (원문 삭제 금지 — 결정의 역사 보존).

### 승인 게이트

두 제안을 제시한 뒤 물어본다: **A) 둘 다 반영**, **B) PRD만**, **C) ADR만**, **D) 반영하지 않음(제안만 보관)**.
승인된 것만 Edit/Write로 반영하고, 반영 후 변경된 부분을 짧게 요약 보고한다.
D를 고르면 아무 파일도 건드리지 않는다.

---

## Mode Quick Reference

```
  ┌──────────────┬──────────────┬───────────────┬──────────────┬───────────────────┐
  │              │  EXPANSION   │  SELECTIVE    │  HOLD SCOPE  │  REDUCTION        │
  ├──────────────┼──────────────┼───────────────┼──────────────┼───────────────────┤
  │ Scope        │ Push UP      │ Hold + offer  │ Maintain     │ Push DOWN         │
  │              │ (opt-in)     │ (cherry-pick) │              │                   │
  │ Recommend    │ Enthusiastic │ Neutral       │ N/A          │ N/A               │
  │ posture      │              │               │              │                   │
  │ 10x check    │ Mandatory    │ As candidate  │ Optional     │ Skip              │
  │ Platonic     │ Yes          │ No            │ No           │ No                │
  │ ideal        │              │               │              │                   │
  │ Delight opps │ Opt-in       │ Cherry-pick   │ Note if seen │ Skip              │
  │              │ ceremony     │ ceremony      │              │                   │
  │ Complexity   │ "충분히      │ "맞는 크기 +  │ "너무        │ "이게 진짜        │
  │ question     │  큰가?"      │  뭐가 더      │  복잡한가?"  │  최소인가?"       │
  │              │              │  탐나는가?"   │              │                   │
  │ Temporal     │ Full         │ Full          │ Key only     │ Skip              │
  │ interrogate  │              │               │              │                   │
  │ Design (S8)  │ "Inevitable" │ If UI scope   │ If UI scope  │ Skip              │
  │              │ UI review    │               │              │                   │
  └──────────────┴──────────────┴───────────────┴──────────────┴───────────────────┘
```

---

## 다음 단계 안내 (리뷰 종료 시)

완료 요약 뒤에, 상황에 맞는 다음 스킬을 한국어로 추천한다:

- **`/plan-design-review`** — DESIGN_SCOPE가 감지됐거나 수락된 확장에 UI 기능이 포함된 경우.
  (REDUCTION 모드에서는 보통 불필요 — scope 축소에 디자인 리뷰는 이르다.)
- **`/plan-eng-review`** — scope가 확정됐으니 아키텍처·테스트 관점 리뷰로 넘어갈 때. scope가
  크게 바뀌었다면(확장 수락·방향 전환) 강조해서 추천한다.
- **`/spec`** — 확정된 PRD를 구현 가능한 스펙/step으로 내릴 때.

둘 다 필요하면 eng review를 먼저 (게이트 성격), design review를 다음에 추천한다.
