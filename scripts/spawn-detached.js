#!/usr/bin/env node
// Spawns a fully detached child process and writes its PID, independent of
// the launching shell's lifetime. Needed because Git Bash on Windows ties
// plain `cmd &` background jobs to the same console as the parent bash
// process - they were observed dying as soon as frontend-up.sh's bash
// process (and the npm/PowerShell chain above it) returned to the prompt,
// even though nothing in the dev server itself crashed (logs showed a
// clean "Ready" with no error, then nothing further).
//
// On Windows, avoid running the command through cmd.exe (shell:true) when
// possible - cmd.exe itself was observed not to survive detachment, and
// even when it appeared to work, pnpm/cmd.exe exited early while next dev
// kept running as an orphan under an untracked PID, breaking
// frontend-down.sh's ability to find and stop it. Pass an already-resolved
// node binary as `cmd` (e.g. the real `node`) to avoid the shell entirely;
// shell:true is only used as a fallback when `cmd` isn't `node`/`node.exe`.
//
// Usage: node scripts/spawn-detached.js <name> <cwd> <command> [args...]
// <cwd> is relative to the repo root (or '.' for the root itself).
// Writes logs/<name>.log (appended, stdout+stderr combined) and
// .pids/<name>.pid, matching what frontend-down.sh expects.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const [name, cwdArg, cmd, ...args] = process.argv.slice(2);
if (!name || !cwdArg || !cmd) {
  console.error('Usage: spawn-detached.js <name> <cwd> <command> [args...]');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const cwd = path.resolve(root, cwdArg);
const logPath = path.join(root, 'logs', `${name}.log`);
const pidPath = path.join(root, '.pids', `${name}.pid`);

// VS Code's integrated terminal injects NODE_OPTIONS=--require .../bootloader.js
// plus VSCODE_INSPECTOR_OPTIONS (its "Auto Attach" debugger hook) into every
// Node process the terminal spawns. That bootloader tries to keep an IPC
// connection back to VS Code's debug adapter alive for each process - fine
// for a normal foreground command, but for a process meant to outlive this
// terminal it was causing the child to die immediately with zero output
// (no error, nothing - the log file stayed completely empty). Stripping both
// lets the dev server run as a plain, undebugged Node process.
const env = { ...process.env };
delete env.NODE_OPTIONS;
delete env.VSCODE_INSPECTOR_OPTIONS;

const out = fs.openSync(logPath, 'a');
const isWin = process.platform === 'win32';
const isNode = cmd === 'node' || cmd === 'node.exe' || cmd === process.execPath;

let child;
if (!isWin || isNode) {
  // Direct exec - no shell layer, so child.pid is the real, final process
  // for the command's entire lifetime (what we want for clean teardown).
  child = spawn(cmd, args, { cwd, env, detached: true, stdio: ['ignore', out, out] });
} else {
  // Node warns (DEP0190) if shell:true is combined with a separate args
  // array - it stops escaping them. None of our args contain spaces/shell
  // metachars, so joining into one string is safe and is the form Node
  // itself recommends for the shell:true case.
  child = spawn([cmd, ...args].join(' '), {
    cwd, env, detached: true, stdio: ['ignore', out, out], shell: true, windowsHide: true,
  });
}

fs.writeFileSync(pidPath, String(child.pid));
child.unref();
