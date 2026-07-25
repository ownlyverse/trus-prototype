---
name: autoplan
description: docs/PRD.md에 대해 CEO→디자인→엔지니어링 리뷰를 자동 체인으로 돌리고 취향 판단만 사용자에게 묻는다. 기획 초안 후 한 번에 리뷰를 끝내고 싶을 때 사용.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
  - Skill
  - AskUserQuestion
---

# /autoplan — 자동 리뷰 파이프라인

> **출처**: [garrytan/gstack](https://github.com/garrytan/gstack)의 `autoplan` 스킬을 경량 이식한 것이다
> (MIT License — 원문 라이선스는 이 디렉토리의 `LICENSE.txt` 동봉).
> **각색**: 원본의 상태 저장·사용 로그 전송·자동 업데이트·외부 CLI 이중 보이스 등 기계장치를
> 전부 제거하고, 이 저장소의 문서 체계와 이식된 리뷰 스킬 체인에 맞게 재배선했다.
> **언어**: 방법론 본문은 영어 원문을 유지하되, **사용자에게 보이는 질문·보고·요약은 전부 한국어**로 한다.
> **체인**: `docs/PRD.md` 입력 → `plan-ceo-review`(전략·범위) → `plan-design-review`(UI 범위가
> 있을 때만 → `docs/UI_GUIDE.md`) → `plan-eng-review`(→ `docs/ARCHITECTURE.md`·`docs/ADR.md`)
> → 최종 승인 게이트 → `/spec`으로 step화 안내. 각 리뷰 스킬은 **Skill 도구**로 호출한다.
> plan-devex-review(DX 리뷰)는 이 저장소에 이식하지 않았다 — DX 단계는 없다.
> **파일 쓰기 전 사용자 승인 필수** — docs/ 갱신은 항상 변경 요약을 보여주고 승인받은 뒤에만 한다.

One command. Rough plan in, fully reviewed plan out.

/autoplan runs the ported review skills in sequence at full depth — same rigor, same
sections, same methodology as running each skill manually. The only difference:
intermediate questions are auto-decided using the 6 principles below. Taste decisions
(where reasonable people could disagree) are surfaced at a final approval gate,
**in Korean**.

## When to invoke this skill

Use when asked to "auto review", "autoplan", "리뷰 다 돌려줘", "알아서 결정해줘",
or when the user has a fresh `docs/PRD.md` and wants the full review gauntlet
without answering 15-30 intermediate questions.

---

## The 6 Decision Principles

These rules auto-answer every intermediate question:

1. **Choose completeness** — Ship the whole thing. Pick the approach that covers more edge cases.
2. **Boil lakes** — Fix everything in the blast radius (files/areas touched by this plan + direct importers). Auto-approve expansions that are in blast radius AND small (< 5 files, no new infra).
3. **Pragmatic** — If two options fix the same thing, pick the cleaner one. 5 seconds choosing, not 5 minutes.
4. **DRY** — Duplicates existing functionality? Reject. Reuse what exists.
5. **Explicit over clever** — 10-line obvious fix > 200-line abstraction. Pick what a new contributor reads in 30 seconds.
6. **Bias toward action** — Progress > review cycles > stale deliberation. Flag concerns but don't block.

**Conflict resolution (context-dependent tiebreakers):**
- **CEO phase:** P1 (completeness) + P2 (boil lakes) dominate.
- **Design phase:** P5 (explicit) + P1 (completeness) dominate.
- **Eng phase:** P5 (explicit) + P3 (pragmatic) dominate.

---

## Decision Classification

Every auto-decision is classified:

**Mechanical** — one clearly right answer. Auto-decide silently.
Examples: run the next review phase (always yes), reduce scope on a complete plan (always no).

**Taste** — reasonable people could disagree. Auto-decide with recommendation, but
surface at the final gate. Three natural sources:
1. **Close approaches** — top two are both viable with different tradeoffs.
2. **Borderline scope** — in blast radius but 3-5 files, or ambiguous radius.
3. **Cross-review disagreements** — a later phase contradicts an earlier phase's
   settled finding with a valid point.

**User Challenge** — the review concludes the user's stated direction should change.
This is qualitatively different from taste decisions. When a review phase recommends
merging, splitting, adding, or removing features/scope that the user specified in
`docs/PRD.md`, this is a User Challenge. It is NEVER auto-decided.

User Challenges go to the final approval gate with richer context than taste decisions:
- **What the user said:** (their original direction in the PRD)
- **What the review recommends:** (the change)
- **Why:** (the reasoning)
- **What context we might be missing:** (explicit acknowledgment of blind spots)
- **If we're wrong, the cost is:** (what happens if the user's original direction
  was right and we changed it)

The user's original direction is the default. The review must make the case for
change, not the other way around.

**Exception:** If the change is flagged as a security vulnerability or feasibility
blocker (not a preference), the question framing explicitly warns (in Korean):
"이것은 취향이 아니라 보안/실현 가능성 리스크로 판단됩니다." The user still decides,
but the framing is appropriately urgent.

---

## Sequential Execution — MANDATORY

Phases MUST execute in strict order: **CEO → Design → Eng**.
Each phase MUST complete fully before the next begins.
NEVER run phases in parallel — each builds on the previous.

Between each phase, emit a phase-transition summary (in Korean) and verify that all
required outputs from the prior phase are collected before starting the next.
Feed each phase's key findings forward into the next phase's context.

---

## What "Auto-Decide" Means

Auto-decide replaces the USER'S judgment with the 6 principles. It does NOT replace
the ANALYSIS. Every section in the invoked review skill must still be executed at the
same depth as the interactive version. The only thing that changes is who answers the
intermediate question: you do, using the 6 principles, instead of the user.

**Two exceptions — never auto-decided:**
1. Premises (Phase 1) — require human judgment about what problem to solve.
2. User Challenges — when the review concludes the user's stated direction should
   change (merge, split, add, remove features/scope). The user always has context
   the review lacks. See Decision Classification above.

**You MUST still:**
- READ the actual code, docs, and files each section references
- PRODUCE every output the section requires (tables, diagrams, doc updates)
- IDENTIFY every issue the section is designed to catch
- DECIDE each issue using the 6 principles (instead of asking the user)
- LOG each decision in the audit trail

**You MUST NOT:**
- Compress a review section into a one-liner table row
- Write "no issues found" without showing what you examined
- Skip a section because "it doesn't apply" without stating what you checked and why
- Produce a summary instead of the required output

"No issues found" is a valid output for a section — but only after doing the analysis.
State what you examined and why nothing was flagged (1-2 sentences minimum).
"Skipped" is never valid for a non-skip-listed section.

---

## Phase 0: Intake

### Step 1: Read context

- Read `docs/PRD.md`. **If it does not exist**, ask the user (한국어):
  "docs/PRD.md가 없습니다. `/office-hours`로 먼저 PRD를 만들까요, 아니면 다른 계획
  문서를 지정하시겠어요?" — if they choose office-hours, invoke it via the Skill tool,
  then resume here.
- Read `CLAUDE.md`, `.claude/rules/rules.md`, `git log -15`, and any existing
  `docs/UI_GUIDE.md` / `docs/ARCHITECTURE.md` / `docs/ADR.md`.
- Run `git status` — if docs/ has uncommitted changes, tell the user (한국어) before
  proceeding, so review edits stay distinguishable in `git diff`.
- **Detect UI scope**: grep the PRD for view/rendering terms (component, screen, form,
  button, modal, layout, dashboard, sidebar, nav, dialog, 화면, 버튼, 폼, 모달,
  레이아웃, 대시보드). Require 2+ matches. Exclude false positives ("page" alone,
  "UI" in acronyms). UI scope decides whether Phase 2 runs.

### Step 2: Announce the pipeline (한국어)

Output: "리뷰 대상: [PRD 한 줄 요약]. UI 범위: [있음/없음]. 파이프라인:
plan-ceo-review → [plan-design-review →] plan-eng-review. 중간 질문은 6원칙으로
자동 결정하고, 취향 판단과 유저 챌린지만 마지막에 모아서 여쭙겠습니다."

---

## Phase 1: CEO Review (Strategy & Scope)

Invoke `plan-ceo-review` via the **Skill tool** and follow it at full depth against
`docs/PRD.md`. Override: every intermediate question → auto-decide using the 6 principles.

**Override rules:**
- Premises: accept reasonable ones (P6), challenge only clearly wrong ones.
- **GATE: Present premises to the user for confirmation (한국어)** — this is the ONE
  mid-pipeline question that is NOT auto-decided. Premises require human judgment.
- Alternatives: pick highest completeness (P1). If tied, pick simplest (P5).
  If top 2 are close → mark TASTE DECISION.
- Scope expansion: in blast radius + small → approve (P2). Outside → defer with
  rationale (P3). Duplicates → reject (P4). Borderline (3-5 files) → mark TASTE DECISION.
- All review sections: run fully, auto-decide each issue, log every decision.
- Scope changes that contradict the user's stated PRD direction → USER CHALLENGE
  (never auto-decided; hold for the final gate).

**Mandatory outputs from Phase 1:**
- "NOT in scope" list with deferred items and rationale
- "What already exists" mapping (sub-problems → existing code)
- Proposed `docs/PRD.md` scope updates (drafted, NOT yet written — see File-Write Approval)
- Phase completion summary

**PHASE 1 COMPLETE.** Emit phase-transition summary (한국어):
> **Phase 1 완료.** 발견 [N]건, 자동 결정 [M]건, 취향 판단 [K]건 보류.
> 전제 게이트: [통과/사용자 수정]. Phase 2로 넘어갑니다.

Do NOT begin Phase 2 until the premise gate has been passed and all Phase 1
outputs are collected.

---

## Phase 2: Design Review (conditional — skip if no UI scope)

**Skip condition:** If UI scope was NOT detected in Phase 0, skip this phase entirely.
Log (한국어): "Phase 2 생략 — UI 범위 없음."

Invoke `plan-design-review` via the **Skill tool** and follow it at full depth.
Its output target is `docs/UI_GUIDE.md`. Override: every intermediate question →
auto-decide using the 6 principles.

**Override rules:**
- Focus areas: all relevant dimensions (P1).
- Structural issues (missing states, broken hierarchy): auto-fix (P5).
- Aesthetic/taste issues (tone, density, visual direction): mark TASTE DECISION.
- Design-system alignment: auto-fix if `docs/UI_GUIDE.md` already exists and the
  fix is obvious; otherwise draft the guide section and flag anything debatable.
- Feed Phase 1 findings (scope decisions, deferred items) into this phase's context.
- Scope changes that contradict the user's PRD direction → USER CHALLENGE.

**Mandatory outputs from Phase 2 (if run):**
- Dimension-by-dimension evaluation with scores
- Missing interaction states identified (loading, empty, error, partial)
- Proposed `docs/UI_GUIDE.md` updates (drafted, NOT yet written)
- Phase completion summary

**PHASE 2 COMPLETE.** Emit phase-transition summary (한국어):
> **Phase 2 완료.** 발견 [N]건, 자동 결정 [M]건, 취향 판단 [K]건 보류.
> Phase 3으로 넘어갑니다.

---

## Phase 3: Eng Review (Architecture & Tests)

Invoke `plan-eng-review` via the **Skill tool** and follow it at full depth.
Its output targets are `docs/ARCHITECTURE.md` and `docs/ADR.md`. Override: every
intermediate question → auto-decide using the 6 principles.

**Override rules:**
- Scope challenge: never reduce a complete plan (P2).
- Architecture choices: explicit over clever (P5). If two sound architectures
  compete with different tradeoffs → TASTE DECISION.
- Test plan: always include all relevant coverage (P1); map every new codepath
  to a test type. This project is TDD — tests are step-level acceptance criteria.
- Feed Phase 1 (and Phase 2, if run) findings into this phase's context.
- Durable decisions (data model, framework choice, boundaries) → draft as ADR
  entries with alternatives and rationale.
- Scope changes that contradict the user's PRD direction → USER CHALLENGE.

**Mandatory outputs from Phase 3:**
- Architecture dependency sketch (new components vs existing ones)
- Test mapping: each new codepath → test type → exists/gap
- Proposed `docs/ARCHITECTURE.md` and `docs/ADR.md` updates (drafted, NOT yet written)
- Failure modes list with critical gap flags
- Phase completion summary

**PHASE 3 COMPLETE.** Emit phase-transition summary (한국어), then proceed to the
Final Approval Gate.

---

## Decision Audit Trail

Log every auto-decision as you go (keep it in the conversation; it is presented at
the final gate and written to docs only with user approval):

```markdown
| # | Phase | Decision | Classification | Principle | Rationale | Rejected alternative |
|---|-------|----------|----------------|-----------|-----------|----------------------|
```

One row per decision. No silent auto-decisions.

---

## File-Write Approval (파일 쓰기 전 사용자 승인 필수)

- During Phases 1-3, doc updates are **drafted in the conversation**, never written
  to disk silently.
- All `docs/` writes happen **after the Final Approval Gate**, once the user approves.
- Exception: if a later phase genuinely needs an earlier phase's output saved as a
  file, ask for approval for that one file at the end of that phase (변경 요약을
  한국어로 제시 → 승인 → 쓰기).
- Never write outside `docs/` (and this conversation) without an explicit user request.

---

## Pre-Gate Verification

Before presenting the Final Approval Gate, verify these were actually produced:

- [ ] Phase 1: premise challenge with specific premises named (not just "premises accepted")
- [ ] Phase 1: "NOT in scope" + "What already exists" + proposed PRD updates
- [ ] Phase 2 (if run): all dimensions scored, missing states identified, proposed UI_GUIDE updates
- [ ] Phase 3: architecture sketch, test mapping, failure modes, proposed ARCHITECTURE/ADR updates
- [ ] Every section has findings OR an explicit "examined X, nothing flagged"
- [ ] Decision Audit Trail has at least one row per auto-decision (not empty)
- [ ] Cross-phase themes checked (same concern raised independently in 2+ phases)

If ANY item is missing, go back and produce it. Max 2 attempts — if still missing
after retrying twice, proceed to the gate with a warning (한국어) naming what is
incomplete. Do not loop indefinitely.

---

## Phase 4: Final Approval Gate

**STOP here and present the final state to the user — 전부 한국어로.**

```
## /autoplan 리뷰 완료

### 계획 요약
[1-3문장 요약]

### 결정 현황: 총 [N]건 (자동 [M]건 · 취향 판단 [K]건 · 유저 챌린지 [J]건)

### 유저 챌린지 (리뷰가 PRD의 방향 수정을 권고)
[각 챌린지마다:]
**챌린지 [N]: [제목]** ([phase]에서)
- 원래 방향: [사용자가 PRD에 명시한 것]
- 리뷰 권고: [변경안]
- 이유: [근거]
- 놓치고 있을 수 있는 맥락: [블라인드 스팟]
- 틀렸을 때의 비용: [원래 방향이 옳았다면 잃는 것]
[보안/실현 가능성이면: "⚠️ 취향이 아니라 보안/실현 가능성 리스크로 판단됩니다."]

원래 방향이 기본값입니다 — 명시적으로 바꾸신 것만 반영합니다.

### 취향 판단 (당신의 선택)
[각 항목마다:]
**선택 [N]: [제목]** ([phase]에서)
추천: [X] — [원칙]. 다만 [Y]도 유효합니다: [Y 선택 시 후속 영향 1문장]

### 자동 결정: [M]건 (아래 Decision Audit Trail 참조)

### 리뷰 요약 점수
- CEO: [요약] / Design: [요약 또는 "생략 — UI 범위 없음"] / Eng: [요약]

### 교차 테마
[2개 이상 phase에서 독립적으로 나온 우려가 있으면 명시. 없으면 "없음 — phase별 우려가 서로 달랐음"]

### 문서 변경안 (승인 대기 — 승인 후에만 파일에 씀)
- docs/PRD.md: [변경 요약]
- docs/UI_GUIDE.md: [변경 요약 또는 "해당 없음"]
- docs/ARCHITECTURE.md / docs/ADR.md: [변경 요약]
```

**Cognitive load management:**
- 0 user challenges: skip the 유저 챌린지 section.
- 0 taste decisions: skip the 취향 판단 section.
- 1-7 taste decisions: flat list. 8+: group by phase and warn (한국어):
  "이 계획은 모호성이 유난히 높았습니다([N]건). 꼼꼼히 봐주세요."

Then ask (한국어), options:
- A) 그대로 승인 (추천안 전부 수락)
- B) 일부 바꿔서 승인 (바꿀 취향 판단/챌린지 지정)
- C) 질의 (특정 결정에 대해 더 묻기)
- D) 계획 수정 (PRD 자체를 고침)
- E) 반려 (처음부터 다시)

**Option handling (종료 조건):**
- A: 승인 — write all approved doc updates, then Completion below.
- B: ask which overrides, apply them, re-present the gate.
- C: answer freeform (한국어), re-present the gate.
- D: apply changes, re-run only the affected phases (scope→Phase 1, design→Phase 2,
  architecture/tests→Phase 3). **Max 3 revision cycles**, then stop and hand back.
- E: stop. Nothing is written. Suggest `/office-hours` if the premise itself was wrong.

---

## Completion

After approval and writes, report (한국어):

1. **갱신된 문서 요약** — `git diff --stat docs/` 결과와 함께, 문서별 핵심 변경
   1-2줄 (PRD 범위 확정, UI_GUIDE 상태 정의, ARCHITECTURE 구조, ADR 결정 등).
2. **결정 기록** — 자동 [M]건 / 취향 [K]건 / 챌린지 [J]건 처리 결과.
3. **다음 단계 안내**: "다음 단계: `/spec`으로 이 계획을 실행 가능한 step으로
   변환하세요 (AC 포함 step화 → 하네스 실행)."

---

## Important Rules

- **Never abort.** The user chose /autoplan. Respect that choice. Surface all taste
  decisions at the gate; never redirect to interactive review mid-pipeline.
- **Two mid-pipeline gates only.** The non-auto-decided questions are: (1) premise
  confirmation in Phase 1, and (2) User Challenges (held for the final gate).
  Everything else is auto-decided using the 6 principles.
- **Log every decision.** No silent auto-decisions. Every choice gets a row in the
  audit trail.
- **Full depth means full depth.** Do not compress or skip sections from the invoked
  review skills. Read what the section asks you to read, produce what it requires,
  identify every issue, decide each one. If you catch yourself writing fewer than
  3 sentences for any review section, you are likely compressing.
- **Artifacts are deliverables.** Proposed doc updates, test mapping, failure modes,
  audit trail — these must exist when the review completes. If they don't, the
  review is incomplete.
- **Sequential order.** CEO → Design → Eng. Each phase builds on the last.
- **No writes without approval.** Every `docs/` write is preceded by a Korean summary
  and explicit user approval.
- **사용자 대면 출력은 한국어.** 질문·보고·요약·게이트는 예외 없이 한국어로 한다.
