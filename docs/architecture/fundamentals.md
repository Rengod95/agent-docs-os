# Docs-Agent OS: Architecture Fundamentals

> docs/ 기반 에이전트 운영 시스템의 설계 원론, 구조 분석, 이식성 전략을 담은 문서.

---

## 1. 시스템 정의

Docs-Agent OS는 `docs/` 디렉터리 구조를 통해 AI 에이전트의 작업 흐름을 제어하는 **수동적 운영 체계(passive operating system)** 다.

핵심 전제:
- 에이전트는 코드를 읽기/수정하기 **전에** `docs/`를 먼저 경유한다
- 모든 작업은 **의도(intent)** 와 **범위(scope)** 로 분류된다
- 작업 상태는 코드가 아닌 **문서 파일(YAML, Markdown)** 에 기록된다
- 세션이 바뀌어도 **문서 상태를 통해 작업이 이어진다**

### 운영 체계로서의 비유

| OS 개념 | Docs-Agent OS 대응 |
|---------|-------------------|
| Boot loader | CLAUDE.md → `docs/README.md` (라우터) |
| Process table | `state/current.yaml` (전역 상태판) |
| File system | `features/`, `references/`, `decisions/` |
| Process context | `features/<id>/current.md` (작업 허브) |
| Checkpoint/restore | `state/checkpoints/` |
| System calls | 의도+범위 분류 → 필수 경유 경로 |

---

## 2. 4-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLAUDE.md                       │  ← Boot: 에이전트 진입점
│              (Bootstrap Directive)               │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              docs/README.md                      │  ← Router: 의도+범위 분류
│            (Global Task Router)                  │     필수 경유 경로 결정
└────┬──────────┬──────────┬──────────┬───────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ state/ │ │ refs/  │ │ feat/  │ │ deci/  │
│        │ │        │ │        │ │        │
│ 전역   │ │ 배경   │ │ 작업   │ │ 판단   │
│ 상태   │ │ 원문   │ │ 허브   │ │ 기록   │
└────────┘ └────────┘ └────────┘ └────────┘
  Layer 1    Layer 2    Layer 3    Layer 4
```

### Layer 1: State (전역 상태)

**역할:** 현재 활성 작업, 리스크, 다음 액션을 한눈에 파악하는 상태판.

| 파일 | 역할 |
|-----|------|
| `current.yaml` | 전역 상태판 (활성 feature, hot files, risks, next actions) |
| `checkpoints/` | 세션 handoff 스냅샷 |

**설계 원칙:**
- current.yaml는 **얇게** 유지. 세부 상태는 feature `current.md`로 위임
- Checkpoint는 **세션 종료 시** 또는 **handoff 필요 시** 에만 생성
- 상태 파일이 없으면 `.template`에서 생성

### Layer 2: References (배경 원문)

**역할:** 작업이 **왜** 그 구조를 따라야 하는지, 어떤 **제약**이 있는지를 알려주는 참고 문서.

| 파일 | 역할 |
|-----|------|
| `index.yaml` | 문서 레지스트리 (id, title, kind, path, tags) |
| `<kind>/` | 종류별 하위 디렉터리 (architecture, product, specification, testing, policy, external) |

**설계 원칙:**
- index.yaml로 **먼저 좁히고**, 원문은 **필요한 부분만** 읽는다
- feature와의 연결은 **reference가 아닌 feature의 meta.yaml**이 소유한다
- 새 문서 추가 시 index.yaml 갱신은 **같은 커밋**에서

### Layer 3: Features (작업 허브)

**역할:** 실제 작업이 진행되는 장소. 모든 작업은 결국 특정 feature를 기준으로 진행된다.

| 파일 | 역할 |
|-----|------|
| `README.md` | feature 개요 (TL;DR, scope, entry points, main flow) |
| `meta.yaml` | 메타데이터 (status, importance, primary_paths, related_references) |
| `current.md` | **작업 상태 허브** (task profile, goal, progress, risks, next step) |
| `decisions.md` | feature-local 판단 기록 |
| `workspace/` | 자유 작업 문서 |
| `archive/` | 완료된 current.md 보관 |

**설계 원칙:**
- 진행 상태는 **primary feature의 current.md에만** 기록
- secondary feature는 **링크만**, 상태 중복 기록 금지
- 작업 문서는 `workspace/`에 두고 current.md에 **반드시 연결**
- `_feature-template/`은 복사 시작점이며, 직접 수정 금지

### Layer 4: Decisions (판단 기록)

**역할:** 전역 판단을 기록하고 추적하는 레이어.

| 파일 | 역할 |
|-----|------|
| `decision-log.md` | 모든 작업이 갱신하는 전역 판단 기록 |
| `ADR-*.md` | 구조/정책/패턴 변경 시 작성하는 아키텍처 결정 문서 |

**ADR 작성 기준:** 구조 변경, 공용 패턴 변경, 규칙/정책 변경, 다수 feature 영향, 되돌리기 어려운 결정.

---

## 3. 라우팅 프로토콜

### 작업 시작 시 필수 경유

```
모든 작업 → state/README.md → references/README.md → features/README.md
```

### 의도(Intent) × 범위(Scope) 라우팅 매트릭스

| 의도 \ 범위 | single-feature | multi-feature | cross-cutting | global |
|-------------|---------------|---------------|---------------|--------|
| plan | S R F | S R F | S R F D | S R F D |
| investigate | S R F | S R F | S R F D | S R F D |
| fix | S R F | S R F | S R F D | S R F D |
| change | S R F | S R F | S R F D | S R F D |
| add | S R F | S R F | S R F D | S R F D |
| refactor | S R F D | S R F D | S R F D | S R F D |
| govern | S R D | S R D F | S R D F | S R D |

> S=state, R=references, F=features, D=decisions

### 종료 프로토콜

모든 작업 종료 시 갱신:
1. `state/current.yaml`
2. `decisions/decision-log.md`
3. 관련 feature의 `current.md`

구조 변경 시 추가: feature의 `README.md`, `meta.yaml`, `decisions.md`, ADR.

---

## 4. 2계층 파일 모델 (Scaffold vs Instance)

이식성의 핵심은 **스캐폴드(universal)** 와 **인스턴스(project-specific)** 의 분리다.

### 구분 기준

| 구분 | 식별 | 특성 | 예시 |
|------|------|------|------|
| **스캐폴드** | `README.md`, `*.template`, `_feature-template/` | 프로젝트 무관, 규칙과 구조를 정의 | `docs/README.md`, `current.yaml.template` |
| **인스턴스** | `.template` 없는 실제 파일, 실제 feature 폴더 | 프로젝트 고유, 템플릿에서 생성됨 | `current.yaml`, `features/auth/` |

### 파일 소유권

```
scaffold-owned (업데이트 시 덮어쓰기 가능):
  docs/README.md
  docs/state/README.md
  docs/state/current.yaml.template
  docs/state/checkpoints/checkpoint.md.template
  docs/references/README.md
  docs/references/index.yaml.template
  docs/features/README.md
  docs/features/index.yaml.template
  docs/features/_feature-template/**
  docs/decisions/README.md
  docs/decisions/decision-log.md.template
  docs/decisions/ADR.md.template

instance-owned (절대 덮어쓰기 금지):
  docs/state/current.yaml
  docs/state/checkpoints/*.md (실제 checkpoint)
  docs/references/index.yaml
  docs/references/<kind>/*.md (실제 문서)
  docs/features/index.yaml
  docs/features/<feature-id>/** (실제 feature)
  docs/decisions/decision-log.md
  docs/decisions/ADR-*.md (실제 ADR)
```

---

## 5. 구조적 갭 분석

현재 시스템이 **수동적 문서 구조**에서 **능동적 에이전트 운영 체계**로 기능하려면 해결해야 할 갭.

### 5.1 부트스트랩 부재 (Critical)

`CLAUDE.md`에 docs 시스템으로의 진입 지시가 없다. 에이전트가 `docs/README.md`를 읽어야 한다는 것을 알 방법이 없으므로 **시스템 전체가 비활성 상태**다.

**해결:** CLAUDE.md에 필수 지시문 추가. 이것 없이는 나머지 모든 것이 무의미.

### 5.2 상태 일관성 보장 없음 (High)

4개 상태 표면(current.yaml, feature/current.md, meta.yaml, decision-log.md)이 동기화되어야 하지만:
- 순서 제약 없음 (어떤 파일을 먼저 갱신?)
- 일관성 불변식 없음 (`current.yaml.active_features`에 X가 있으면 `features/X/`가 반드시 존재해야)
- 검증 메커니즘 없음 (종료 프로토콜 준수 여부를 확인할 수 없음)
- 롤백 경로 없음 (부분 갱신 시 상태 발산)

### 5.3 메타데이터 이중 소유 (Medium)

`features/index.yaml`과 `features/<id>/meta.yaml`이 동일 필드(status, importance, related_references)를 중복 보유. 어느 것이 정본(canonical)인지 미정의.

**해결:** meta.yaml을 정본으로, index.yaml은 파생된 요약으로 정의.

### 5.4 의도/범위 분류 지원 부족 (Medium)

7개 의도 × 4개 범위 = 28가지 조합이지만, 각 의도의 정의가 한 줄이며 경계 조건이나 예시가 없다. 에이전트마다 다르게 분류할 수 있다.

**해결:** 의사결정 트리 또는 분류 예시 추가.

### 5.5 토큰 예산 미정의 (Medium)

필수 사전 읽기 경로(README 4개 + current.yaml + index.yaml + feature current.md)의 토큰 비용이 정의되지 않음. 현재 최소 ~1,800 토큰이지만, feature와 reference가 늘면 급증.

**해결:** 라우팅 오버헤드의 토큰 예산 상한 설정 (예: 5k 토큰).

### 5.6 코드→Feature 역방향 인덱스 없음 (Low)

`meta.yaml`의 `primary_paths`로 feature→코드 방향은 가능하지만, 코드→feature 역방향 조회가 불가. 에이전트가 특정 파일이 어떤 feature에 속하는지 알려면 모든 meta.yaml을 스캔해야 한다.

### 5.7 Feature 생명주기 미정의 (Low)

`meta.yaml`의 `status` 필드에 유효한 값(draft, active, paused, completed, archived, deprecated)과 전이 규칙이 없다.

### 5.8 멀티 에이전트 조율 없음 (Low — 현재)

단일 `primary_feature` 모델은 본질적으로 단일 에이전트 설계. 복수 에이전트 동시 작업 시 상태 충돌이 발생하나, 현재는 우선순위 낮음.

### 5.9 에러 복구 프로토콜 없음 (Low)

current.yaml이 존재하지 않는 feature를 참조하거나, current.md의 데이터가 모순될 때의 복구 절차가 문서화되지 않음.

---

## 6. 스캐폴딩 전략 비교

### 요약 비교표

| 접근법 | 변수 치환 | 업데이트 전략 | CLAUDE.md 주입 | 의존성 | 이식성 |
|--------|---------|-------------|--------------|--------|--------|
| GitHub Template Repo | X | X (수동) | 수동 | 없음 | GitHub only |
| **npx initializer** | O | O (--update) | O | Node.js | 높음 |
| degit/tiged | X | 파괴적 덮어쓰기 | 수동 | Node.js | 중간 |
| Git subtree | X | 3-way merge | 수동 | Git | 높음 (구조 분리 시) |
| Git submodule | X | pin 이동 | 수동 | Git | 중간 |
| **Copier** | O (Jinja2) | **3-way merge** | O (_tasks) | Python/pipx | 높음 |
| Yeoman | O (EJS) | 파일별 선택 | O | Node.js | 중간 (쇠퇴) |
| **Shell script** | 제한적 (sed) | X | O (cat >>) | POSIX | 최고 |
| Monorepo 내부 패키지 | O | PR 기반 | O | 모노레포 | 낮음 (내부용) |

### 핵심 문제별 최적 접근

| 문제 | 최적 | 이유 |
|------|------|------|
| 기존 프로젝트에 docs/ 추가 | Copier, npx | 기존 파일 보존, 선택적 생성 |
| 스캐폴드 버전 업데이트 + 기존 커스터마이징 보존 | **Copier** | 유일하게 3-way merge 지원 (원본 출력 vs 현재 파일 vs 새 템플릿) |
| CLAUDE.md fragment 주입 | Copier, npx, shell | 파일 조작 로직 포함 가능 |
| 의존성 최소화 | Shell script | POSIX만 필요 |
| 솔로 개발자 최저 마찰 | Shell (init) → Copier (ongoing) | 초기엔 단순, 이후 업데이트 필요 시 전환 |

### 권장 전략: 2-tier

1. **Primary: Copier** — 변수 치환, 3-way merge 업데이트, CLAUDE.md 주입, Git tag 기반 버전 관리
2. **Fallback: Shell script** — Python 불가 환경을 위한 zero-dependency 대안 (초기 복사만, 업데이트 미지원)

---

## 7. CLAUDE.md 연동 설계

### Bootstrap Directive (필수)

스캐폴드가 존재해도 에이전트가 이를 모르면 무용. CLAUDE.md에 아래 구조의 지시문이 필요:

```
1. 작업 시작 전 → docs/README.md 읽기 (라우터)
2. 라우터 지시에 따라 state/ → references/ → features/ 경유
3. 작업 종료 시 → 종료 프로토콜 수행
```

### Fragment Injection 전략

CLAUDE.md fragment는 마커 코멘트로 감싸서 멱등성(idempotent) 주입:

```markdown
<!-- docs-agent-os:start -->
(지시문 내용)
<!-- docs-agent-os:end -->
```

이렇게 하면:
- 두 번 실행해도 중복 없음
- 업데이트 시 마커 사이만 교체
- 사용자의 다른 CLAUDE.md 내용과 충돌 없음

---

## 8. 이식성 확보를 위한 추가 고려사항

### 8.1 Init 멱등성

초기화를 두 번 실행해도 파일이 중복되거나 손상되지 않아야 한다.

### 8.2 기존 docs/ 공존

프로젝트에 이미 `docs/`가 있을 때, 기존 내용을 파괴하지 않고 병합하거나 중단해야 한다.

### 8.3 스캐폴드 버전 식별

프로젝트에 설치된 스캐폴드 버전을 식별할 수 있어야 한다 (`.docs-agent-os-version` 또는 Copier의 `.copier-answers.yml`).

### 8.4 다국어 고려

현재 모든 README와 템플릿이 한국어. 다국어 지원이 필요하면:
- 템플릿 변수로 locale 분기, 또는
- 언어별 스캐폴드 variant 분리

### 8.5 조건부 포함

프로젝트 유형(모노레포, 라이브러리, 단일 앱)에 따라 기본값이 달라야 한다면, Copier의 조건부 파일 포함 기능 활용.

---

## 9. 향후 작업 우선순위

| 순위 | 작업 | 영향 | 노력 |
|------|------|------|------|
| P0 | CLAUDE.md bootstrap directive 작성 | 시스템 활성화 | 낮음 |
| P1 | 상태 일관성 불변식 정의 | 상태 발산 방지 | 중간 |
| P1 | 의도/범위 분류 예시 추가 | 라우팅 정확도 | 중간 |
| P2 | meta.yaml 정본 선언 | 메타데이터 drift 방지 | 낮음 |
| P2 | Feature status 유효값 열거 | 생명주기 명확화 | 낮음 |
| P2 | 토큰 예산 상한 설정 | 에이전트 효율 | 낮음 |
| P3 | Copier 템플릿 repo 구축 | 이식성 확보 | 높음 |
| P3 | Shell script fallback 작성 | 의존성 없는 대안 | 중간 |
| P3 | 에러 복구 프로토콜 문서화 | 시스템 회복력 | 중간 |
| P4 | 코드→Feature 역방향 인덱스 | 탐색 효율 | 중간 |
| P4 | 멀티 에이전트 조율 모델 | 확장성 | 높음 |
