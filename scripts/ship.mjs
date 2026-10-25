#!/usr/bin/env node
/**
 * Opt-in local ship helper — build, optionally pin to IPFS, optionally commit.
 *
 *   npm run ship
 *   npm run ship -- --push
 *   npm run ship -- --push -m "Publish first essay."
 *   npm run ship -- --ipfs          (Pinata upload after build; needs PINATA_JWT in .env.local)
 *   npm run ship -- --mirror        (push the built site in out/ to a gh-pages branch; see below)
 *
 * --push commits only what is ready to publish. Markdown under ontology/ whose frontmatter
 * `stage` is not published or canonical (draft, review, or missing) is left out of the commit
 * and listed, so unfinished writing never lands on main by accident.
 *
 * --mirror pushes out/ as a single fresh commit to the gh-pages branch of MIRROR_REPO
 * (e.g. MIRROR_REPO=REPLACE_ME/REPLACE_ME in .env.local). Set MIRROR_CNAME too if the mirror
 * serves a custom domain. It force-pushes that branch only; your main branch is untouched.
 *
 * This is an example. Wire your own host (Pages, Netlify, etc.) as you prefer.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvFiles } from "./lib/load-env.mjs";
import { runSync } from "./lib/run-cmd.mjs";

const args = process.argv.slice(2);
const push = args.includes("--push");
const ipfs = args.includes("--ipfs");
const mirror = args.includes("--mirror");
const messageIdx = args.indexOf("-m");
const message =
  messageIdx >= 0 && args[messageIdx + 1]
    ? args[messageIdx + 1]
    : `ship ${new Date().toISOString().slice(0, 10)}`;

function run(label, command, cmdArgs = [], opts = {}) {
  const result = runSync(command, cmdArgs, {
    stdio: opts.inherit === false ? "pipe" : "inherit",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    if (opts.inherit === false) {
      if (result.stdout?.trim()) console.error(result.stdout.trim());
      if (result.stderr?.trim()) console.error(result.stderr.trim());
    }
    console.error(`ship: failed at ${label}`);
    process.exit(result.status ?? 1);
  }
  return result;
}

/** Ontology markdown that would be committed but is not published/canonical yet. */
function unpublishedChanges() {
  const st = run("git status", "git", ["status", "--porcelain", "-uall", "--", "ontology"], { inherit: false });
  const held = [];
  for (const line of (st.stdout ?? "").split("\n")) {
    if (!line.trim() || line.startsWith(" D") || line.startsWith("D ")) continue;
    const file = line.slice(3).trim().replace(/^"|"$/g, "");
    if (!/\.mdx?$/.test(file) || !existsSync(file)) continue;
    const m = readFileSync(file, "utf8").match(/^---[\s\S]*?^stage:\s*["']?([\w-]+)/m);
    const stage = (m?.[1] ?? "draft").toLowerCase();
    if (stage !== "published" && stage !== "canonical") held.push(`${file} (stage: ${stage})`);
  }
  return held;
}

function pushMirror() {
  const repo = process.env.MIRROR_REPO?.trim();
  if (!repo || repo.includes("REPLACE_ME")) {
    console.error("ship: --mirror needs MIRROR_REPO=owner/repo in .env.local (currently REPLACE_ME)");
    process.exit(1);
  }
  if (!existsSync("out")) {
    console.error("ship: no out/ folder to mirror; the build did not produce one");
    process.exit(1);
  }
  const dir = mkdtempSync(join(tmpdir(), "ship-mirror-"));
  try {
    cpSync("out", dir, { recursive: true });
    writeFileSync(join(dir, ".nojekyll"), "");
    const cname = process.env.MIRROR_CNAME?.trim();
    if (cname) writeFileSync(join(dir, "CNAME"), `${cname}\n`);
    const git = (label, a) => {
      const r = runSync("git", ["-C", dir, ...a], { stdio: "pipe", encoding: "utf8" });
      if (r.status !== 0) {
        console.error(r.stderr?.trim() || r.stdout?.trim());
        console.error(`ship: mirror failed at ${label}`);
        process.exit(r.status ?? 1);
      }
    };
    git("init", ["init", "-q", "-b", "gh-pages"]);
    git("add", ["add", "-A"]);
    git("commit", ["-c", "user.name=ship", "-c", "user.email=ship@localhost", "commit", "-q", "-m", message]);
    git("push", ["push", "-q", "--force", `https://github.com/${repo}.git`, "gh-pages"]);
    console.log(`ship: mirrored out/ to ${repo} (gh-pages)`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (push) {
  const branchResult = run("git branch", "git", ["branch", "--show-current"], {
    inherit: false,
  });
  const branch = branchResult.stdout?.trim();
  if (branch !== "main") {
    console.error(
      `ship: refusing --push from ${branch || "detached HEAD"}; open a pull request or switch to main`,
    );
    process.exit(1);
  }
}

run("build:global", "npm", ["run", "build:global"]);

loadEnvFiles();

if (ipfs) {
  run("ipfs-relative-export", "node", ["scripts/ipfs-relative-export.mjs"]);
  run("pinata:upload", "npm", ["run", "pinata:upload"]);
  console.log("ship: Pinata pin complete — update NEXT_PUBLIC_IPFS_CID if CID changed, then ship again.");
}

if (mirror) pushMirror();

if (push) {
  const held = unpublishedChanges();
  run("git add", "git", ["add", "-A", "--", "ontology", "src", "public", "package.json", "package-lock.json"], {
    inherit: false,
  });
  if (held.length) {
    const files = held.map((h) => h.replace(/ \(stage: .*\)$/, ""));
    run("git restore --staged", "git", ["restore", "--staged", "--", ...files], { inherit: false });
    console.warn("ship: left these unpublished files out of the commit (set stage: published to include):");
    for (const h of held) console.warn(`  - ${h}`);
  }
  const status = run("git status", "git", ["status", "--porcelain"], { inherit: false });
  if (!status.stdout?.trim()) {
    console.log("ship: nothing to commit");
    process.exit(0);
  }
  const staged = run("git diff --cached", "git", ["diff", "--cached", "--name-only"], { inherit: false });
  if (!staged.stdout?.trim()) {
    console.log("ship: nothing ready to commit");
    process.exit(0);
  }
  run("git commit", "git", ["commit", "-m", message], { inherit: false });
  run("git push", "git", ["push", "origin", "main"]);
  console.log("ship: pushed");
}

if (!push) {
  console.log("ship: build ok — commit and push when ready (npm run ship -- --push -m \"…\")");
}
