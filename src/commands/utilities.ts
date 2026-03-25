import chalk from 'chalk';
import { execSync } from 'child_process';
import { getAllPackages, getPackageUpdates } from '../utils/packages.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const homeDir = process.env.USERPROFILE || process.env.HOME || '';
const favoritesFile = `${homeDir}/.pmfavorites.json`;
const aliasesFile = `${homeDir}/.pmaliases.json`;
const configFile = `${homeDir}/.pmconfig.json`;

export async function showRun(cmd: string) {
  console.log(chalk.yellow(`Running: ${cmd}\n`));
  execSync(cmd, { stdio: 'inherit' });
}

export async function showLink(path: string) {
  console.log(chalk.yellow(`Linking: ${path}`));
  try {
    execSync(`npm link ${path}`, { stdio: 'inherit' });
    console.log(chalk.green('Linked!'));
  } catch {
    console.log(chalk.red('Failed!'));
  }
}

export async function showUnlink(name: string) {
  console.log(chalk.yellow(`Unlinking: ${name}`));
  try {
    execSync(`npm unlink -g ${name}`, { stdio: 'inherit' });
    console.log(chalk.green('Unlinked!'));
  } catch {
    console.log(chalk.red('Failed!'));
  }
}

export async function showStar(name: string) {
  let favorites: string[] = [];
  if (existsSync(favoritesFile)) {
    favorites = JSON.parse(readFileSync(favoritesFile, 'utf8'));
  }

  if (!favorites.includes(name)) {
    favorites.push(name);
    writeFileSync(favoritesFile, JSON.stringify(favorites, null, 2));
    console.log(chalk.green(`Added to favorites: ${name}`));
  } else {
    console.log(chalk.yellow('Already in favorites!'));
  }
}

export async function showFavorites() {
  console.log(chalk.cyan('\nFAVORITE PACKAGES\n'));
  
  if (existsSync(favoritesFile)) {
    const favorites = JSON.parse(readFileSync(favoritesFile, 'utf8'));
    favorites.forEach((f: string) => {
      console.log(chalk.green(`  ${f}`));
    });
  } else {
    console.log(chalk.gray('No favorites yet!'));
  }
  console.log('');
}

export async function showAlias(alias?: string, pkg?: string) {
  let aliases: Record<string, string> = {};
  if (existsSync(aliasesFile)) {
    aliases = JSON.parse(readFileSync(aliasesFile, 'utf8'));
  }

  if (!alias || alias === 'list') {
    console.log(chalk.cyan('\nALIASES\n'));
    const entries = Object.entries(aliases);
    if (entries.length > 0) {
      entries.forEach(([k, v]) => {
        console.log(chalk.green(`  ${k} -> ${v}`));
      });
    } else {
      console.log(chalk.gray('No aliases defined!'));
    }
    console.log('');
    return;
  }

  if (alias.includes('=')) {
    const parts = alias.split('=').map(s => s.trim());
    const aliasName = parts[0] || '';
    const pkgName = parts[1] || pkg || '';
    if (aliasName) {
      aliases[aliasName] = pkgName;
      writeFileSync(aliasesFile, JSON.stringify(aliases, null, 2));
      console.log(chalk.green(`Alias created: ${aliasName} -> ${pkgName}`));
    }
  }
}

export async function showPrune() {
  console.log(chalk.yellow('\nPruning unused packages...\n'));
  try {
    execSync('npm prune', { stdio: 'inherit' });
    console.log(chalk.green('Prune complete!'));
  } catch {
    console.log(chalk.red('Prune failed!'));
  }
}

export async function showCron() {
  console.log(chalk.cyan('\nAUTO-CHECK SCHEDULE\n'));
  console.log(chalk.yellow('To enable auto-check, run PowerShell as Admin:\n'));
  console.log(chalk.white('Register-ScheduledTask -TaskName "PM-AutoUpdate" -Trigger (New-ScheduledTaskTrigger -Daily -At "9am") -Action (New-ScheduledTaskAction -Execute "bun" -Argument "run pm-cli/src/index.ts check") -RunLevel Limited'));
  console.log(chalk.gray('\nThis will check for updates daily at 9am\n'));
}

export async function showNotify() {
  const packages = getAllPackages();
  const updates = getPackageUpdates(packages);

  if (updates.length === 0) {
    console.log(chalk.green('\nAll packages up to date!\n'));
  } else {
    console.log(chalk.red(`\nFound ${updates.length} updates:\n`));
    updates.forEach(u => {
      console.log(chalk.yellow(`  - ${u.Name}: ${u.Current} -> ${u.Latest}`));
    });
    console.log('');
  }
}

export async function showWeb() {
  console.log(chalk.yellow('\nOpening npm website...\n'));
  try {
    execSync('start https://www.npmjs.com');
  } catch {}
}

export async function showInit() {
  const config = {
    AutoUpdate: false,
    Notify: false,
    BackupPath: 'packages-backup.json',
    DefaultManager: 'npm'
  };
  writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(chalk.green(`\nConfig created: ${configFile}\n`));
  console.log(chalk.yellow('Current settings:'));
  console.log(chalk.white(JSON.stringify(config, null, 2)));
  console.log('');
}

export async function showConfig() {
  if (existsSync(configFile)) {
    const config = JSON.parse(readFileSync(configFile, 'utf8'));
    console.log(chalk.cyan('\nCURRENT CONFIG\n'));
    console.log(chalk.white(JSON.stringify(config, null, 2)));
    console.log('');
  } else {
    console.log(chalk.yellow('\nNo config found. Run "init" to create.\n'));
  }
}

export async function showSecurity() {
  console.log(chalk.yellow('\nSECURITY AUDIT\n'));
  console.log(chalk.cyan('Running npm audit...\n'));
  try {
    execSync('npm audit', { stdio: 'inherit' });
  } catch {}
  console.log('');
}

export async function showAudit() {
  await showSecurity();
}
