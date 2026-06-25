#!/usr/bin/env node
// Runs the given script with Git Bash specifically, not whatever `bash`
// resolves to first on PATH. On a machine with WSL installed,
// C:\Windows\System32\bash.exe (the WSL launcher) commonly sits ahead of
// Git's own bash.exe in PATH - that silently runs the whole script, and
// every Next.js dev server it spawns, inside the WSL Linux environment
// against this project's Windows-installed node_modules. Next then needs
// the Linux-native SWC binary, which isn't there, and the on-the-fly
// download hangs or fails - so the dev servers never actually bind their
// ports. taskkill-based teardown (frontend-down.sh) also can't touch a
// WSL-side PID, so cleanup silently does nothing too.
//
// Usage: node scripts/run-with-git-bash.js <script> [args...]
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findGitBash() {
  if (process.platform !== 'win32') return 'bash';

  const candidates = [
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Git', 'bin', 'bash.exe'),
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Git', 'bin', 'bash.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'bin', 'bash.exe'),
  ].filter(Boolean);

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    console.error(
      '[run-with-git-bash] Could not find Git Bash in common install locations. ' +
        'Falling back to "bash" on PATH - if WSL is installed, this may run the ' +
        'script inside WSL instead, and dev servers will never bind their ports.',
    );
    return 'bash';
  }
  return found;
}

const bash = findGitBash();
const result = spawnSync(bash, process.argv.slice(2), { stdio: 'inherit' });
process.exit(result.status ?? 1);
