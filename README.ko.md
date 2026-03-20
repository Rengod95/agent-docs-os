# Helm

[![npm version](https://img.shields.io/npm/v/@helmdocs/init.svg)](https://www.npmjs.com/package/@helmdocs/init)
[![npm downloads](https://img.shields.io/npm/dm/@helmdocs/init.svg)](https://www.npmjs.com/package/@helmdocs/init)
[![GitHub stars](https://img.shields.io/github/stars/Rengod95/agent-docs-os.svg)](https://github.com/Rengod95/agent-docs-os)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) | [中文](README.zh.md)

> 문서로 에이전트를 조종하라. AI 코딩 에이전트를 위한 문서 기반 운영 체계.

---

## 이게 뭔가요?

Agent Docs OS는 AI 에이전트가 프로젝트에서 작업하는 방식을 제어하는 디렉터리 구조입니다. 에이전트는 코드를 수정하기 **전에** 문서를 먼저 읽으며, 모든 작업은 Markdown과 YAML 파일을 통해 라우팅, 분류, 추적, 핸드오프됩니다.

AI 에이전트를 위한 OS라고 생각하면 됩니다:

| OS 개념 | Agent Docs OS |
|---------|---------------|
| 부트 로더 | `CLAUDE.md` → `docs/README.md` (라우터) |
| 프로세스 테이블 | `state/current.yaml` (전역 상태판) |
| 파일 시스템 | `features/`, `references/`, `decisions/` |
| 프로세스 컨텍스트 | `features/<id>/current.md` (작업 허브) |
| 체크포인트/복원 | `state/checkpoints/` |
| 시스템 콜 | 의도+범위 분류 → 필수 경유 경로 |

> 아키텍처 이론에 대한 상세 설명은 [Architecture Fundamentals](docs/architecture/fundamentals.md)를 참고하세요.

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│              에이전트 설정 파일                    │  Boot: 에이전트 진입점
│        (CLAUDE.md / AGENTS.md / 등)              │  (부트스트랩 지시문)
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              docs/README.md                      │  Router: 의도+범위 분류
│            (글로벌 태스크 라우터)                   │  필수 경유 경로 결정
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

**Layer 1 — State**: 전역 상태판 (`current.yaml`) + 세션 핸드오프 체크포인트.
**Layer 2 — References**: kind/tags로 색인된 배경 문서. 결정의 "이유"를 담당.
**Layer 3 — Features**: 작업 허브. 각 feature는 `current.md`를 운영 중심으로 사용.
**Layer 4 — Decisions**: 전역 판단 기록 + 아키텍처 결정 문서(ADR).

> 라우팅 매트릭스, 상태 일관성 규칙, 갭 분석은 [Architecture Fundamentals](docs/architecture/fundamentals.md)를 참고하세요.

## 빠른 시작

### 대화형 (권장)

```bash
npx @helmdocs/init
```

```
─────────────────────────────────
  Agent Docs OS Initializer
─────────────────────────────────

? Document directory name (agent_docs) → ___
? AI agent tool → Claude Code / Codex / Cursor / ...
? Inject bootstrap directive? (Y/n) → Y

✓ agent_docs/ structure created
✓ Bootstrap directive injected into CLAUDE.md
✓ Scaffold version: v1.0.0
```

### 비대화형

```bash
npx @helmdocs/init --yes --dir=agent_docs --agent="Claude Code"
```

### Shell 폴백 (Node.js 없는 환경)

```bash
bash <(curl -sL https://raw.githubusercontent.com/Rengod95/agent-docs-os/main/packages/@helmdocs/init/bin/init.sh)
```

## 지원 에이전트

| 에이전트 | 대상 파일 | 주입 방식 |
|---------|----------|----------|
| **Claude Code** | `CLAUDE.md` | Append (멱등 마커) |
| **Codex CLI** | `AGENTS.md` | Append (멱등 마커) |
| **Cursor** | `.cursor/rules/agent-docs.mdc` | Create (frontmatter 포함) |
| **Windsurf** | `.windsurf/rules/agent-docs.md` | Create (trigger 포함) |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Append (멱등 마커) |
| **Cline** | `.clinerules/agent-docs.md` | Create |
| **Aider** | `CONVENTIONS.md` | Create (+ `.aider.conf.yml` 안내) |
| **Custom** | 사용자 지정 경로 | Append |

## 생성되는 구조

```
agent_docs/
├── README.md                          # 글로벌 태스크 라우터
├── .scaffold-version                  # 스캐폴드 버전 추적
├── state/
│   ├── README.md                      # State 레이어 규칙
│   ├── current.yaml.template          # 전역 상태판
│   └── checkpoints/
│       └── checkpoint.md.template     # 세션 핸드오프
├── references/
│   ├── README.md                      # Reference 레이어 규칙
│   └── index.yaml.template            # 문서 레지스트리
├── features/
│   ├── README.md                      # Feature 레이어 규칙
│   ├── index.yaml.template            # Feature 레지스트리
│   └── _feature-template/             # 새 feature 생성 시 복사
│       ├── README.md.template
│       ├── meta.yaml.template
│       ├── current.md.template
│       ├── decisions.md.template
│       ├── workspace/
│       └── archive/
└── decisions/
    ├── README.md                      # Decision 레이어 규칙
    ├── decision-log.md.template       # 전역 판단 기록
    └── ADR.md.template                # 아키텍처 결정 문서
```

**스캐폴드 파일** (README.md, *.template)은 범용 — 프로젝트에 무관한 규칙과 구조.
**인스턴스 파일** (current.yaml, 실제 feature, ADR)은 프로젝트별로 템플릿에서 생성.

## CLI 옵션

| 플래그 | 설명 | 기본값 |
|-------|------|-------|
| `--yes`, `-y` | 비대화형 모드, 모든 기본값 수락 | `false` |
| `--dir=NAME` | 문서 디렉터리 이름 | `agent_docs` |
| `--agent=NAME` | 에이전트 도구 이름 (지원 목록 참고) | `Claude Code` |
| `--no-inject` | 부트스트랩 지시문 주입 건너뛰기 | `false` |

## 동작 원리

에이전트 설정 파일에 주입되는 부트스트랩 지시문이 세 가지 프로토콜을 강제합니다:

### 1. 작업 시작 프로토콜
```
state/ 읽기 → references/ 읽기 → features/ 읽기 → 관련 feature 식별
```

### 2. 작업 분류
모든 작업은 **의도** (`plan`, `investigate`, `fix`, `change`, `add`, `refactor`, `govern`)와 **범위** (`single-feature`, `multi-feature`, `cross-cutting`, `global`)로 분류됩니다. 라우터가 필수 경유 레이어를 결정합니다.

### 3. 작업 종료 프로토콜
```
state/current.yaml 갱신 → decisions/decision-log.md 갱신 → feature의 current.md 갱신
```

## 기여

1. 저장소 포크
2. Feature 브랜치 생성
3. `packages/@helmdocs/init/` 에서 변경
4. 테스트: `node src/onboard.mjs --yes`
5. PR 제출

## 라이선스

MIT
