# Helm

[![npm version](https://img.shields.io/npm/v/@helmdocs/init.svg)](https://www.npmjs.com/package/@helmdocs/init)
[![npm downloads](https://img.shields.io/npm/dm/@helmdocs/init.svg)](https://www.npmjs.com/package/@helmdocs/init)
[![GitHub stars](https://img.shields.io/github/stars/Rengod95/agent-docs-os.svg)](https://github.com/Rengod95/agent-docs-os)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[한국어](README.ko.md) | [中文](README.zh.md)

> Helm your agents with docs. A docs-driven operating system for AI coding agents.

---

## What is this?

Agent Docs OS is a directory structure that controls how AI agents work on your project. Agents read docs **before** touching code — every task is routed, classified, tracked, and handed off through plain Markdown and YAML files.

Think of it as an OS for your AI agent:

| OS Concept | Agent Docs OS |
|-----------|---------------|
| Boot loader | `CLAUDE.md` → `docs/README.md` (router) |
| Process table | `state/current.yaml` (global state board) |
| File system | `features/`, `references/`, `decisions/` |
| Process context | `features/<id>/current.md` (work hub) |
| Checkpoint/restore | `state/checkpoints/` |
| System calls | Intent + Scope classification → mandatory routing paths |

> For a deep dive into the architecture theory, see [Architecture Fundamentals](docs/architecture/fundamentals.md).

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Agent Config File                   │  Boot: agent entry point
│        (CLAUDE.md / AGENTS.md / etc.)            │  (bootstrap directive)
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              docs/README.md                      │  Router: classify intent + scope
│            (Global Task Router)                  │  determine mandatory paths
└────┬──────────┬──────────┬──────────┬───────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ state/ │ │ refs/  │ │ feat/  │ │ deci/  │
│        │ │        │ │        │ │        │
│ Global │ │ Back-  │ │ Work   │ │ Deci-  │
│ State  │ │ ground │ │ Hubs   │ │ sion   │
│        │ │ Docs   │ │        │ │ Log    │
└────────┘ └────────┘ └────────┘ └────────┘
 Layer 1    Layer 2    Layer 3    Layer 4
```

**Layer 1 — State**: Global state board (`current.yaml`) + session handoff checkpoints.
**Layer 2 — References**: Background documents indexed by kind/tags. The "why" behind decisions.
**Layer 3 — Features**: Work hubs. Each feature has `current.md` as its operational center.
**Layer 4 — Decisions**: Global decision log + Architecture Decision Records (ADRs).

> For routing matrices, state consistency rules, and gap analysis, see [Architecture Fundamentals](docs/architecture/fundamentals.md).

## Quick Start

### Interactive (recommended)

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

### Non-interactive

```bash
npx @helmdocs/init --yes --dir=agent_docs --agent="Claude Code"
```

### Shell fallback (no Node.js)

```bash
bash <(curl -sL https://raw.githubusercontent.com/Rengod95/agent-docs-os/main/packages/@helmdocs/init/bin/init.sh)
```

## Supported Agents

| Agent | Target File | Injection |
|-------|-----------|-----------|
| **Claude Code** | `CLAUDE.md` | Append (idempotent markers) |
| **Codex CLI** | `AGENTS.md` | Append (idempotent markers) |
| **Cursor** | `.cursor/rules/agent-docs.mdc` | Create (with frontmatter) |
| **Windsurf** | `.windsurf/rules/agent-docs.md` | Create (with trigger) |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Append (idempotent markers) |
| **Cline** | `.clinerules/agent-docs.md` | Create |
| **Aider** | `CONVENTIONS.md` | Create (+ `.aider.conf.yml` note) |
| **Custom** | User-specified path | Append |

## What Gets Created

```
agent_docs/
├── README.md                          # Global task router
├── .scaffold-version                  # Scaffold version tracker
├── state/
│   ├── README.md                      # State layer rules
│   ├── current.yaml.template          # Global state board
│   └── checkpoints/
│       └── checkpoint.md.template     # Session handoff
├── references/
│   ├── README.md                      # Reference layer rules
│   └── index.yaml.template            # Document registry
├── features/
│   ├── README.md                      # Feature layer rules
│   ├── index.yaml.template            # Feature registry
│   └── _feature-template/             # Copy this for new features
│       ├── README.md.template
│       ├── meta.yaml.template
│       ├── current.md.template
│       ├── decisions.md.template
│       ├── workspace/
│       └── archive/
└── decisions/
    ├── README.md                      # Decision layer rules
    ├── decision-log.md.template       # Global decision log
    └── ADR.md.template                # Architecture Decision Record
```

**Scaffold files** (README.md, *.template) are universal — project-agnostic rules and structure.
**Instance files** (current.yaml, actual features, ADRs) are generated from templates per project.

## CLI Options

| Flag | Description | Default |
|------|-----------|---------|
| `--yes`, `-y` | Non-interactive mode, accept all defaults | `false` |
| `--dir=NAME` | Document directory name | `agent_docs` |
| `--agent=NAME` | Agent tool name (see supported list) | `Claude Code` |
| `--no-inject` | Skip bootstrap directive injection | `false` |

## How It Works

The bootstrap directive injected into your agent config file enforces three protocols:

### 1. Task Start Protocol
```
Read state/ → Read references/ → Read features/ → Identify relevant feature
```

### 2. Task Classification
Every task is classified by **intent** (`plan`, `investigate`, `fix`, `change`, `add`, `refactor`, `govern`) and **scope** (`single-feature`, `multi-feature`, `cross-cutting`, `global`). The router determines which layers are mandatory.

### 3. Task Exit Protocol
```
Update state/current.yaml → Update decisions/decision-log.md → Update feature's current.md
```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes in `packages/@helmdocs/init/`
4. Test: `node src/onboard.mjs --yes`
5. Submit a PR

## License

MIT
