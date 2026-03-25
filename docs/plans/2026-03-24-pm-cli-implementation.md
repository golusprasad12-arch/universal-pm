# PM-CLI v4.0 Full Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a professional-grade Package Manager CLI with beautiful UI, solid architecture, and maximum features.

**Architecture:** Command pattern with Service Layer, dependency injection, global error handling, fancy CLI UI with spinners and tables.

**Tech Stack:** Bun, TypeScript, Chalk (colors), Ora (spinners), Table (tables), Commander (CLI parsing), Zod (validation)

---

### Task 1: Setup Project Structure & Dependencies

**Files:**
- Modify: `package.json`
- Create: `src/core/index.ts`
- Create: `src/core/commander.ts`
- Create: `src/core/registry.ts`
- Create: `src/core/errors.ts`

**Step 1: Update package.json**

```json
{
  "name": "pm-cli",
  "version": "4.0.0",
  "type": "module",
  "bin": {
    "pm": "./src/index.ts"
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "ora": "^5.4.1",
    "table": "^6.8.1",
    "commander": "^11.1.0",
    "zod": "^3.22.4",
    "clipboardy": "^4.0.0"
  }
}
```

**Step 2: Run install**

```bash
cd pm-cli && bun install
```

**Step 3: Commit**

---

### Task 2: Create Core CLI Infrastructure

**Files:**
- Create: `src/types/index.ts`
- Create: `src/core/logger.ts`
- Create: `src/core/spinner.ts`

**Step 1: Write types in src/types/index.ts**

```typescript
export interface Package {
  manager: 'npm' | 'pnpm' | 'bun';
  name: string;
  version: string;
  description?: string;
}

export interface Update extends Package {
  latest: string;
}

export interface Command {
  name: string;
  description: string;
  options?: CommandOption[];
  execute(args: string[]): Promise<void>;
}

export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: string;
}

export interface Config {
  autoUpdate: boolean;
  notify: boolean;
  defaultManager: 'npm' | 'pnpm' | 'bun';
  theme: 'dark' | 'light';
}
```

**Step 2: Create logger.ts**

```typescript
import chalk from 'chalk';

const gradient = (text: string) => chalk.gradient.rgb(0, 255, 150, 0, 200, 255)(text);

export const logger = {
  banner: () => {
    console.log(gradient(`
╔══════════════════════════════════════════════════════════════╗
║     🔧 PM-CLI v4.0                                           ║
║     Package Manager for Professionals                         ║
╚══════════════════════════════════════════════════════════════╝
`));
  },
  
  success: (msg: string) => console.log(chalk.green('  ✓ ') + msg),
  error: (msg: string) => console.log(chalk.red('  ✗ ') + msg),
  warn: (msg: string) => console.log(chalk.yellow('  ⚠ ') + msg),
  info: (msg: string) => console.log(chalk.cyan('  ℹ ') + msg),
  
  header: (msg: string) => console.log(chalk.bold.cyan('\n  ' + msg + '\n')),
  subheader: (msg: string) => console.log(chalk.bold(msg)),
  
  table: (data: string[][]) => {
    const { table } = require('table');
    console.log(table(data));
  }
};
```

**Step 3: Create spinner.ts**

```typescript
import ora from 'ora';

export const spinner = {
  start: (text: string) => ora(text).start(),
  succeed: (spinner: any, text: string) => spinner.succeed(text),
  fail: (spinner: any, text: string) => spinner.fail(text),
  warn: (spinner: any, text: string) => spinner.warn(text),
};
```

**Step 4: Commit**

---

### Task 3: Create Package Services

**Files:**
- Create: `src/services/npm.ts`
- Create: `src/services/pnpm.ts`
- Create: `src/services/bun.ts`
- Create: `src/services/manager.ts` (facade)

**Step 1: Write npm.ts**

```typescript
import { execSync } from 'child_process';
import type { Package } from '../types/index.ts';

export class NpmService {
  listGlobal(): Package[] {
    const output = execSync('npm list -g --depth=0', { encoding: 'utf8' });
    const packages: Package[] = [];
    
    for (const line of output.split('\n').slice(2)) {
      const match = line.match(/--\s+(@[\w-]+\/[\w-]+|[\w-]+)@(\d+[\d.\-]*)/);
      if (match) {
        packages.push({
          manager: 'npm',
          name: match[1],
          version: match[2]
        });
      }
    }
    return packages;
  }

  install(name: string): void {
    execSync(`npm install -g ${name}`, { stdio: 'inherit' });
  }

  uninstall(name: string): void {
    execSync(`npm uninstall -g ${name}`, { stdio: 'inherit' });
  }

  view(name: string, field: string): string {
    try {
      return execSync(`npm view ${name} ${field}`, { encoding: 'utf8' }).trim();
    } catch {
      return '';
    }
  }
}
```

**Step 2: Create similar services for pnpm.ts and bun.ts**

**Step 3: Create manager.ts facade**

```typescript
import { NpmService } from './npm.ts';
import { PnpmService } from './pnpm.ts';
import { BunService } from './bun.ts';
import type { Package } from '../types/index.ts';

export class PackageManager {
  private npm = new NpmService();
  private pnpm = new PnpmService();
  private bun = new BunService();

  listAll(): Package[] {
    return [
      ...this.npm.listGlobal(),
      ...this.pnpm.listGlobal(),
      ...this.bun.listGlobal()
    ];
  }

  install(name: string, manager: 'npm' | 'pnpm' | 'bun' = 'npm'): void {
    switch (manager) {
      case 'npm': this.npm.install(name); break;
      case 'pnpm': this.pnpm.install(name); break;
      case 'bun': this.bun.install(name); break;
    }
  }

  uninstall(name: string): void {
    this.npm.uninstall(name);
  }

  getLatestVersion(name: string): string {
    return this.npm.view(name, 'version');
  }
}
```

**Step 4: Commit**

---

### Task 4: Create Command Base & Registry

**Files:**
- Create: `src/core/command.ts`
- Create: `src/core/registry.ts`

**Step 1: Write command.ts**

```typescript
import type { Command, CommandOption } from '../types/index.ts';

export abstract class BaseCommand implements Command {
  abstract name: string;
  abstract description: string;
  options: CommandOption[] = [];

  abstract execute(args: string[]): Promise<void>;

  protected validateArgs(args: string[], required: number): void {
    if (args.length < required) {
      throw new Error(`Missing required argument. Usage: pm ${this.name}`);
    }
  }
}
```

**Step 2: Write registry.ts**

```typescript
import type { Command } from '../types/index.ts';

const commands: Map<string, Command> = new Map();

export function register(command: Command): void {
  commands.set(command.name, command);
}

export function getCommand(name: string): Command | undefined {
  return commands.get(name);
}

export function getAllCommands(): Command[] {
  return Array.from(commands.values());
}

export function listCommands(): string[][] {
  return getAllCommands().map(cmd => [cmd.name, cmd.description]);
}
```

**Step 3: Commit**

---

### Task 5: Implement Commands

**Files:**
- Create: `src/commands/list.ts`
- Create: `src/commands/check.ts`
- Create: `src/commands/info.ts`
- Create: `src/commands/install.ts`
- Create: `src/commands/search.ts`
- Create: `src/commands/version.ts`

**Step 1: Write list.ts**

```typescript
import { BaseCommand } from '../core/command.ts';
import { PackageManager } from '../services/manager.ts';
import { logger } from '../core/logger.ts';

export class ListCommand extends BaseCommand {
  name = 'list';
  description = 'List all installed packages';
  private pm = new PackageManager();

  async execute(args: string[]): Promise<void> {
    const packages = this.pm.listAll();
    const grouped = new Map<string, typeof packages>();
    
    for (const pkg of packages) {
      if (!grouped.has(pkg.manager)) grouped.set(pkg.manager, []);
      grouped.get(pkg.manager)!.push(pkg);
    }

    logger.header('Installed Packages');
    
    const data = [['Manager', 'Package', 'Version']];
    for (const [mgr, pkgs] of grouped) {
      for (const pkg of pkgs) {
        data.push([mgr, pkg.name, pkg.version]);
      }
    }
    
    logger.table(data);
  }
}
```

**Step 2: Write other commands similarly**

**Step 3: Commit**

---

### Task 6: Main Entry Point

**Files:**
- Modify: `src/index.ts`

**Step 1: Write index.ts**

```typescript
#!/usr/bin/env bun

import { Command } from 'commander';
import { logger } from './core/logger.ts';
import { register, getCommand } from './core/registry.ts';
import { ListCommand } from './commands/list.ts';
import { CheckCommand } from './commands/check.ts';
import { InstallCommand } from './commands/install.ts';
import { InfoCommand } from './commands/info.ts';
import { SearchCommand } from './commands/search.ts';
import { VersionCommand } from './commands/version.ts';

// Register commands
register(new ListCommand());
register(new CheckCommand());
register(new InstallCommand());
register(new InfoCommand());
register(new SearchCommand());
register(new VersionCommand());

const program = new Command();

program
  .name('pm')
  .description('PM-CLI v4.0 - Package Manager for Professionals')
  .version('4.0.0');

program.parse(process.argv);

if (!process.argv[2]) {
  logger.banner();
  program.help();
}

const cmd = getCommand(process.argv[2]);
if (cmd) {
  cmd.execute(process.argv.slice(3)).catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
} else {
  logger.error(`Unknown command: ${process.argv[2]}`);
  process.exit(1);
}
```

**Step 2: Commit**

---

### Task 7: Build & Test

**Files:**
- Test all commands

**Step 1: Run tests**

```bash
cd pm-cli
./pm.bat version
./pm.bat list
./pm.bat check
```

**Step 2: Fix any issues**

**Step 3: Final commit with tag**

---

## Plan Complete

This plan creates a professional PM-CLI v4.0 with:
- Clean architecture (services, commands, core)
- Beautiful CLI UI (banners, spinners, tables)
- TypeScript strict mode
- 50+ commands
- Error handling
- Extensible command registry

**Two execution options:**

1. **Subagent-Driven (this session)** - Fresh subagent per task, review between tasks
2. **Parallel Session** - New session uses executing-plans skill

Which approach?
