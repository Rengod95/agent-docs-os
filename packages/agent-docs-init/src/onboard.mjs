#!/usr/bin/env node

import { createRequire } from "node:module";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_DIR = resolve(__dirname, "..");
const TEMPLATES_DIR = resolve(PKG_DIR, "templates");
const FRAGMENTS_DIR = resolve(PKG_DIR, "fragments");
const CWD = process.cwd();

// ─── Parse CLI args ───
const args = process.argv.slice(2);
const flagYes = args.includes("--yes") || args.includes("-y");
const flagDir = args.find((a) => a.startsWith("--dir="))?.split("=")[1];
const flagAgent = args.find((a) => a.startsWith("--agent="))?.split("=")[1];
const flagNoInject = args.includes("--no-inject");

// ─── Dynamic import of inquirer ───
let inquirer;
try {
  const require = createRequire(import.meta.url);
  inquirer = (await import("inquirer")).default;
} catch {
  console.error("Error: inquirer not installed. Run: npm install");
  process.exit(1);
}

// ─── Agent definitions ───
const AGENTS = {
  "Claude Code": {
    file: "CLAUDE.md",
    fragment: "claude-code.md",
    mode: "append",
    frontmatter: null,
  },
  "Codex CLI": {
    file: "AGENTS.md",
    fragment: "codex.md",
    mode: "append",
    frontmatter: null,
  },
  Cursor: {
    file: ".cursor/rules/agent-docs.mdc",
    fragment: "cursor.mdc",
    mode: "create",
    frontmatter: null, // already in fragment
  },
  Windsurf: {
    file: ".windsurf/rules/agent-docs.md",
    fragment: "windsurf.md",
    mode: "create",
    frontmatter: null,
  },
  "GitHub Copilot": {
    file: ".github/copilot-instructions.md",
    fragment: "github-copilot.md",
    mode: "append",
    frontmatter: null,
  },
  Cline: {
    file: ".clinerules/agent-docs.md",
    fragment: "cline.md",
    mode: "create",
    frontmatter: null,
  },
  Aider: {
    file: "CONVENTIONS.md",
    fragment: "aider.md",
    mode: "create",
    frontmatter: null,
  },
  Custom: {
    file: null,
    fragment: "claude-code.md",
    mode: "append",
    frontmatter: null,
  },
};

const MARKER_START = "<!-- agent-docs-os:start -->";
const MARKER_END = "<!-- agent-docs-os:end -->";

// ─── Helpers ───
function printBanner() {
  console.log("");
  console.log("─────────────────────────────────");
  console.log("  Agent Docs OS Initializer");
  console.log("─────────────────────────────────");
  console.log("");
}

function loadFragment(fragmentFile, docsDir) {
  const fragPath = join(FRAGMENTS_DIR, fragmentFile);
  if (!existsSync(fragPath)) {
    console.error(`Error: fragment not found: ${fragPath}`);
    process.exit(1);
  }
  let content = readFileSync(fragPath, "utf-8");
  content = content.replaceAll("{docsDir}", docsDir);
  return content;
}

function injectAppend(targetPath, content) {
  const fullPath = resolve(CWD, targetPath);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (existsSync(fullPath)) {
    const existing = readFileSync(fullPath, "utf-8");
    // Idempotent: replace existing marker block
    if (existing.includes(MARKER_START)) {
      const re = new RegExp(
        `${escapeRegex(MARKER_START)}[\\s\\S]*?${escapeRegex(MARKER_END)}`,
        "g"
      );
      const updated = existing.replace(re, content);
      writeFileSync(fullPath, updated, "utf-8");
      return "updated";
    }
    // Append
    appendFileSync(fullPath, "\n\n" + content, "utf-8");
    return "appended";
  }

  writeFileSync(fullPath, content, "utf-8");
  return "created";
}

function injectCreate(targetPath, content) {
  const fullPath = resolve(CWD, targetPath);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
  return existsSync(fullPath) ? "created" : "failed";
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Main ───
async function main() {
  printBanner();

  let answers;
  if (flagYes) {
    answers = {
      docsDir: flagDir || "agent_docs",
      agent: flagAgent || "Claude Code",
    };
  } else {
    answers = await inquirer.prompt([
      {
        type: "input",
        name: "docsDir",
        message: "Document directory name",
        default: "agent_docs",
        validate: (v) =>
          /^[a-zA-Z0-9_.-]+$/.test(v) || "Use alphanumeric, _, -, . only",
      },
      {
        type: "list",
        name: "agent",
        message: "AI agent tool",
        choices: Object.keys(AGENTS),
        default: "Claude Code",
      },
    ]);
  }

  // Custom agent: ask for path
  let agentConfig = AGENTS[answers.agent];
  if (answers.agent === "Custom") {
    if (flagYes) {
      console.error("Error: --agent=Custom requires interactive mode.");
      process.exit(1);
    }
    const custom = await inquirer.prompt([
      {
        type: "input",
        name: "file",
        message: "Custom agent config file path",
        validate: (v) => v.length > 0 || "Path is required",
      },
    ]);
    agentConfig = { ...agentConfig, file: custom.file };
  }

  const { docsDir } = answers;
  const targetDir = resolve(CWD, docsDir);

  // ─── Check existing ───
  if (existsSync(targetDir)) {
    if (flagYes) {
      console.log(`${docsDir}/ exists — overwriting scaffold files (--yes).`);
    } else {
      const { proceed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: `${docsDir}/ already exists. Overwrite scaffold files?`,
          default: false,
        },
      ]);
      if (!proceed) {
        console.log("Aborted.");
        process.exit(0);
      }
    }
  }

  // ─── Copy templates ───
  console.log("");
  console.log(`Creating ${docsDir}/ ...`);
  cpSync(TEMPLATES_DIR, targetDir, { recursive: true });

  // Create workspace/archive READMEs
  const wsPath = join(targetDir, "features/_feature-template/workspace/README.md");
  if (!existsSync(wsPath)) {
    mkdirSync(dirname(wsPath), { recursive: true });
    writeFileSync(wsPath, "# Workspace\n\nFree-form working documents for this feature.\n");
  }
  const archPath = join(targetDir, "features/_feature-template/archive/README.md");
  if (!existsSync(archPath)) {
    mkdirSync(dirname(archPath), { recursive: true });
    writeFileSync(archPath, "# Archive\n\nArchived current.md snapshots.\n");
  }

  // Write scaffold version
  writeFileSync(join(targetDir, ".scaffold-version"), "1.0.0\n");

  console.log(`✓ ${docsDir}/ structure created`);

  // ─── Inject bootstrap fragment ───
  let inject = !flagNoInject;
  if (!flagYes) {
    const ans = await inquirer.prompt([
      {
        type: "confirm",
        name: "inject",
        message: `Inject bootstrap directive into ${agentConfig.file}?`,
        default: true,
      },
    ]);
    inject = ans.inject;
  }

  if (inject && agentConfig.file) {
    const fragmentContent = loadFragment(agentConfig.fragment, docsDir);

    let result;
    if (agentConfig.mode === "append") {
      // Wrap with markers for idempotent injection into existing files
      const wrappedContent = `${MARKER_START}\n${fragmentContent}\n${MARKER_END}`;
      result = injectAppend(agentConfig.file, wrappedContent);
    } else {
      // Create mode: file is wholly owned, no markers needed
      result = injectCreate(agentConfig.file, fragmentContent);
    }
    console.log(`✓ Bootstrap directive ${result} in ${agentConfig.file}`);
  }

  // Aider special case
  if (answers.agent === "Aider") {
    console.log("");
    console.log("Note: Add to your .aider.conf.yml:");
    console.log(`  read: CONVENTIONS.md`);
  }

  console.log(`✓ Scaffold version: v1.0.0`);
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
