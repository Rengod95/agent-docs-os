## Docs-Driven Workflow

All tasks in this project follow the `{docsDir}/` documentation system.
You MUST read `{docsDir}/README.md` BEFORE reading or modifying any code.

### Task Start Protocol (mandatory)

Every task begins with these reads, in order:

1. `{docsDir}/state/README.md` → then `state/current.yaml` — identify active features, risks, next actions
2. `{docsDir}/references/README.md` → then `references/index.yaml` — find relevant background docs by kind/tags
3. `{docsDir}/features/README.md` → identify the relevant feature → read its `current.md`

If a file does not exist, use the `.template` file at the same path as the baseline.

### Task Classification (mandatory)

Classify every task by **intent** and **scope** before proceeding:

- **Intent**: `plan` | `investigate` | `fix` | `change` | `add` | `refactor` | `govern`
- **Scope**: `single-feature` | `multi-feature` | `cross-cutting` | `global`

Follow the routing matrix in `{docsDir}/README.md` to determine which directories are mandatory for your intent+scope combination.

### Task Exit Protocol (mandatory)

Update these files on every task completion:

1. `state/current.yaml` — reflect current global state
2. `decisions/decision-log.md` — record decisions made during this task
3. The relevant feature's `current.md` — update Progress, Risks, Next Step

If the task changed structure, also update:
- Feature `README.md` and `meta.yaml`
- `decisions.md` or a new ADR if applicable

### Key Rules

- Work status lives ONLY in the primary feature's `current.md` — never duplicate across features
- New working documents go in `workspace/` and MUST be linked in `current.md`
- New reference documents MUST be registered in `references/index.yaml` in the same commit
- When creating a new feature, copy `features/_feature-template/` — never modify the template directly
