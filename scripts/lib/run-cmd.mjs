import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

/** Path to npm-cli.js beside the running node, or null if npm is installed elsewhere. */
export function npmCliJs() {
  const candidate = join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  return existsSync(candidate) ? candidate : null;
}

export function resolveSpawn(command, args) {
  if (command === "npm" || command === "npm.cmd") {
    const cli = npmCliJs();
    if (cli) return { command: process.execPath, args: [cli, ...args] };
    // Fall back to npm on PATH (e.g. Linux packages that install npm separately).
    return { command: process.platform === "win32" ? "npm.cmd" : "npm", args };
  }
  return { command, args };
}

export function runSync(command, args, opts = {}) {
  const resolved = resolveSpawn(command, args);
  return spawnSync(resolved.command, resolved.args, {
    stdio: opts.stdio ?? "inherit",
    shell: false,
    cwd: opts.cwd ?? process.cwd(),
    encoding: opts.encoding === undefined ? "utf8" : opts.encoding,
    env: opts.env ?? process.env,
  });
}
