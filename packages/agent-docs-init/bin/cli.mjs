#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_DIR = resolve(__dirname, "..");

// Hand off to onboard.mjs with all args
try {
  execFileSync("node", [resolve(PKG_DIR, "src/onboard.mjs"), ...process.argv.slice(2)], {
    stdio: "inherit",
    cwd: process.cwd(),
  });
} catch (err) {
  process.exit(err.status || 1);
}
