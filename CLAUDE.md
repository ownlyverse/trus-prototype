# 프로젝트: TRUS 바운더리 타운 프로토타입

## 개요

기능 정의서 기반의 **화면 목업 모음**이다. 빌드 시스템도 패키지 매니저도 없다. 각 화면이 CSS·JS를 인라인으로 품은 **단일 HTML 파일 하나**이고, 데이터는 전부 목데이터다. `index.html`이 화면 목록 허브이며 GitHub Pages(`ownlyverse/trus-prototype`, main 브랜치 루트)로 배포된다.

유저 저니: 메인 홈 → 마이스페이스 구경(데모) → 가입 → 결제(TICKET) → AI 튜터 진단 → 마이스페이스 · 타운(광장) · 강의실.

## 팀 협업 (Max·Patrick·Joy·Esther)

실질적 개발 작업은 **4-에이전트 팀**으로 수행한다 (정의: `.claude/agents/`).

| 에이전트 | 역할 | 색 |
|---|---|---|
| **Max** | 개발/엔지니어 — 구현·TDD | 🔵 |
| **Patrick** | 데이터 — DB 설계·운영·서빙 (데이터 step만 투입) | 🟠 |
| **Joy** | 검수자 — git diff + AC 재실행으로 통과/개선 판정 | 🩷 |
| **Esther** | UI/UX — 디자인·프론트엔드 (UI step만 투입) | 🟡 |

- **하네스**: `python3 scripts/run.py <task>` (권장 — 하네스는 백그라운드, 컬러 대화만 실시간). 여러 phase를 연속으로 돌릴 땐 `python3 scripts/chat.py` + `python3 scripts/execute.py <task> --quiet`.
- **인터랙티브**: `/team <작업>`으로 같은 팀을 호출한다.
- **스킬**: 각 에이전트는 시작 전 `.claude/skills/`의 자기 스킬을 로드한다 (인덱스: `.claude/skills/README.md`).
- Joy는 보고 끝줄에 `VERDICT: PASS` / `VERDICT: IMPROVE`를 찍고, PASS는 AC `exit 0` 근거가 있을 때만 유효하다.
- 모든 팀 대화·보고는 **한국어**로 한다.

이 저장소에 **데이터베이스가 없다.** Patrick은 투입하지 않는다. 반대로 거의 모든 step이 UI라 Esther의 비중이 크다.

## 기술 스택

- 순수 HTML + 인라인 CSS/JS. 프레임워크·번들러·npm 없음.
- 폰트만 CDN(Pretendard). 그 외 외부 의존 없음.
- 상태는 `localStorage`. 키는 `trus_` 접두사.

## 명령어

```bash
node --check <file.js>                  # 인라인 JS를 뽑아 문법 검증
python3 -m http.server 8931             # 로컬 서버 (파일 프로토콜은 일부 기능이 막힘)
python3 -m pytest scripts/ -q           # 하네스 스크립트 테스트
```

`npm run build` 같은 건 없다. **AC 커맨드로 npm/테스트 러너를 쓰지 마라.** 이 저장소의 검증은 `node --check`와 브라우저 확인이다.

## 코드 스타일

- 2-space 들여쓰기.
- 한 화면 = 한 HTML 파일. 파일명은 `<화면>-prototype.html`.
- CSS 변수는 `:root`에 모으고 색을 하드코딩하지 않는다.
- 유저에게 보이는 카피는 **해요체** (어드민 화면만 정보형 문어체).

## 아키텍처 규칙

- CRITICAL: 화면 간 공유 코드를 만들지 마라. 각 HTML은 **자기완결적**이어야 한다 (이유: 파일 하나만 열어도 동작해야 하고, GitHub Pages에 빌드 없이 올라간다).
- CRITICAL: 외부 스크립트·CSS를 새로 추가하지 마라 (Pretendard 제외). CDN이 죽으면 목업이 죽는다.
- 새 화면은 `plaza-lobby-prototype.html`의 디자인 시스템을 복사해서 시작한다 — 밤 배경 `#231B2E` + 별, 크림 종이 카드 `#FFF9F1` + 3px `#17171C` 테두리 + 하드 섀도우, 핫핑크 `#F26D9C`, 픽셀 폰트 사인/버튼. (걷는 픽셀 월드인 `plaza`·`myspace`는 예외 — 기존 톤 유지)
- 새 화면을 만들면 `index.html` 허브에 링크를 추가한다. 단, 배포 제외 대상은 추가하지 않는다.
- 영역 한정·상세 규칙은 `.claude/rules/rules.md` 참조.

## 배포 제외 (중요)

`.gitignore`에 들어간 것은 **의도적으로 공개 배포에서 뺀 것**이다. 지우거나 추적 대상으로 되돌리지 마라.

- `concept-*.html`, `assets/char-*.png` — 컨셉 시안, 로컬 전용
- `docs/` — 기획서·설계서, 로컬 전용
- `phases/reader-*/` — 생각구독 76호 작업 지시서, 로컬 전용

### `reader-prototype.html` — 브랜치 격리

이 파일은 생각구독 76호 **유료 원고 전문과 사진**을 담고 있어 공개되면 안 된다. 그런데 `.gitignore`에 넣으면 이력이 남지 않아 롤백이 불가능하다. 그래서 다음 방식으로 격리한다.

- **`feat-reader-highlight` 브랜치에서만 추적한다.** 하네스가 step마다 커밋하므로 특정 step 상태로 되돌릴 수 있다.
- **CRITICAL: `feat-reader-highlight`를 원격에 푸시하지 마라.** 이 저장소는 공개다 — 브랜치를 올리는 순간 유료 원고가 GitHub에 그대로 노출된다. 이 브랜치는 로컬 전용이다.
- **CRITICAL: `feat-reader-highlight`를 `main`에 머지하지 마라.** `main`은 GitHub Pages와 Railway로 배포되므로 머지하는 순간 유료 원고가 공개된다.
- 공개할 것은 `ebook-reader/index.html` 하나다 — `scripts/build-demo-reader.mjs` 가 원고를 걷어내고 만들며, `scripts/check-demo-leak.mjs` 게이트를 통과해야 한다.
- `main`에서 작업할 때 이 파일이 워킹트리에 있으면 **스테이징하지 마라.** `git add -A`를 쓰기 전에 `git status`로 확인한다.
- 리더기 작업 결과를 `main`에 반영해야 할 일이 생기면, 파일을 옮기지 말고 사람에게 물어라.

## 개발 프로세스

- 이 저장소에는 자동화 테스트 프레임워크가 없다. TDD 대신 **AC = `node --check` 통과 + 브라우저 확인**으로 간다.
- 브라우저 확인은 스크린샷으로 사용자와 왕복한다. 캐시 때문에 수정이 안 보이는 일이 잦으니 `⌘⇧R` 강제 새로고침을 안내한다.
- 인라인 스크립트를 문자열 치환으로 고칠 때, 미디어쿼리는 반드시 기본 규칙 **뒤에** 와야 한다 (이유: 캐스케이드가 뒤집혀 반응형이 죽은 사고 이력).

## 커밋

- 사용자는 **변경마다 즉시 커밋·푸시**하는 습관이다. 다만 **에이전트는 지시 없이 커밋·푸시하지 마라** (이유: 서브에이전트가 임의로 푸시한 사고 2건).
- 커밋 메시지는 **한국어 서술형**이다. `feat:` 같은 prefix를 쓰지 않는다 (이유: 기존 히스토리가 전부 이 형식이다. 예: `광장 로비 — 박스 그리드 + 혼잡도 + 추천 글로우`).
- 커밋 계정은 `ownlyverse <ownlyverse@gmail.com>`.
- 하네스(`scripts/execute.py`)는 step 종료 시 `git add -A`로 코드를 커밋한다. **하네스를 돌리기 전에 워킹트리를 비워라** (이유: 무관한 수정이 step 커밋에 섞여 들어간다).

---

## 이 파일을 신선하게 유지하기

아래 트리거가 발생하면 규칙을 추가/수정한다: 에이전트가 같은 실수를 두 번 했을 때, 코드 리뷰가 에이전트가 알았어야 할 것을 잡아냈을 때, 이전 세션과 같은 교정을 다시 입력하고 있을 때.

step 작업 중 발견한 새 컨벤션은 `phases/<phase>/rules-proposals.md`에 **제안만** 남긴다. `CLAUDE.md`와 `.claude/rules/rules.md`는 사람이 검토 후 병합한다.
