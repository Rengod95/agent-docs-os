# Agent Docs OS

[![npm version](https://img.shields.io/npm/v/agent-docs-init.svg)](https://www.npmjs.com/package/agent-docs-init)
[![npm downloads](https://img.shields.io/npm/dm/agent-docs-init.svg)](https://www.npmjs.com/package/agent-docs-init)
[![GitHub stars](https://img.shields.io/github/stars/Rengod95/agent-docs-os.svg)](https://github.com/Rengod95/agent-docs-os)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) | [한국어](README.ko.md)

> 面向 AI 编程代理的文档驱动操作系统。

---

## 这是什么？

Agent Docs OS 是一个目录结构，用于控制 AI 代理在项目中的工作方式。代理在修改代码**之前**先读取文档——每个任务都通过纯 Markdown 和 YAML 文件进行路由、分类、跟踪和交接。

可以把它想象成 AI 代理的操作系统：

| 操作系统概念 | Agent Docs OS |
|------------|---------------|
| 引导加载器 | `CLAUDE.md` → `docs/README.md`（路由器） |
| 进程表 | `state/current.yaml`（全局状态板） |
| 文件系统 | `features/`、`references/`、`decisions/` |
| 进程上下文 | `features/<id>/current.md`（工作中心） |
| 检查点/恢复 | `state/checkpoints/` |
| 系统调用 | 意图+范围分类 → 必经路由路径 |

> 架构理论的详细说明请参阅 [Architecture Fundamentals](docs/architecture/fundamentals.md)。

## 架构

```
┌─────────────────────────────────────────────────┐
│              代理配置文件                          │  Boot：代理入口
│        (CLAUDE.md / AGENTS.md / 等)              │  （引导指令）
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              docs/README.md                      │  Router：分类意图+范围
│            （全局任务路由器）                        │  确定必经路径
└────┬──────────┬──────────┬──────────┬───────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ state/ │ │ refs/  │ │ feat/  │ │ deci/  │
│        │ │        │ │        │ │        │
│ 全局   │ │ 背景   │ │ 工作   │ │ 决策   │
│ 状态   │ │ 文档   │ │ 中心   │ │ 记录   │
└────────┘ └────────┘ └────────┘ └────────┘
 Layer 1    Layer 2    Layer 3    Layer 4
```

**Layer 1 — State**：全局状态板（`current.yaml`）+ 会话交接检查点。
**Layer 2 — References**：按 kind/tags 索引的背景文档。记录决策的"原因"。
**Layer 3 — Features**：工作中心。每个 feature 以 `current.md` 为运营核心。
**Layer 4 — Decisions**：全局决策日志 + 架构决策记录（ADR）。

> 路由矩阵、状态一致性规则和差距分析请参阅 [Architecture Fundamentals](docs/architecture/fundamentals.md)。

## 快速开始

### 交互模式（推荐）

```bash
npx agent-docs-init
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

### 非交互模式

```bash
npx agent-docs-init --yes --dir=agent_docs --agent="Claude Code"
```

### Shell 后备方案（无 Node.js）

```bash
bash <(curl -sL https://raw.githubusercontent.com/Rengod95/agent-docs-os/main/packages/agent-docs-init/bin/init.sh)
```

## 支持的代理

| 代理 | 目标文件 | 注入方式 |
|------|---------|---------|
| **Claude Code** | `CLAUDE.md` | Append（幂等标记） |
| **Codex CLI** | `AGENTS.md` | Append（幂等标记） |
| **Cursor** | `.cursor/rules/agent-docs.mdc` | Create（含 frontmatter） |
| **Windsurf** | `.windsurf/rules/agent-docs.md` | Create（含 trigger） |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Append（幂等标记） |
| **Cline** | `.clinerules/agent-docs.md` | Create |
| **Aider** | `CONVENTIONS.md` | Create（+ `.aider.conf.yml` 提示） |
| **Custom** | 用户指定路径 | Append |

## 创建的结构

```
agent_docs/
├── README.md                          # 全局任务路由器
├── .scaffold-version                  # 脚手架版本追踪
├── state/
│   ├── README.md                      # State 层规则
│   ├── current.yaml.template          # 全局状态板
│   └── checkpoints/
│       └── checkpoint.md.template     # 会话交接
├── references/
│   ├── README.md                      # Reference 层规则
│   └── index.yaml.template            # 文档注册表
├── features/
│   ├── README.md                      # Feature 层规则
│   ├── index.yaml.template            # Feature 注册表
│   └── _feature-template/             # 创建新 feature 时复制
│       ├── README.md.template
│       ├── meta.yaml.template
│       ├── current.md.template
│       ├── decisions.md.template
│       ├── workspace/
│       └── archive/
└── decisions/
    ├── README.md                      # Decision 层规则
    ├── decision-log.md.template       # 全局决策日志
    └── ADR.md.template                # 架构决策记录
```

**脚手架文件**（README.md、*.template）是通用的——与项目无关的规则和结构。
**实例文件**（current.yaml、实际 feature、ADR）从模板按项目生成。

## CLI 选项

| 标志 | 说明 | 默认值 |
|-----|------|-------|
| `--yes`、`-y` | 非交互模式，接受所有默认值 | `false` |
| `--dir=NAME` | 文档目录名称 | `agent_docs` |
| `--agent=NAME` | 代理工具名称（参见支持列表） | `Claude Code` |
| `--no-inject` | 跳过引导指令注入 | `false` |

## 工作原理

注入到代理配置文件中的引导指令强制执行三个协议：

### 1. 任务启动协议
```
读取 state/ → 读取 references/ → 读取 features/ → 识别相关 feature
```

### 2. 任务分类
每个任务按**意图**（`plan`、`investigate`、`fix`、`change`、`add`、`refactor`、`govern`）和**范围**（`single-feature`、`multi-feature`、`cross-cutting`、`global`）分类。路由器确定哪些层是必经的。

### 3. 任务退出协议
```
更新 state/current.yaml → 更新 decisions/decision-log.md → 更新 feature 的 current.md
```

## 贡献

1. Fork 仓库
2. 创建 feature 分支
3. 在 `packages/agent-docs-init/` 中进行更改
4. 测试：`node src/onboard.mjs --yes`
5. 提交 PR

## 许可证

MIT
