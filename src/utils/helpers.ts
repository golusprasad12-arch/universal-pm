import chalk from 'chalk';
import { execSync } from 'child_process';
import { getAllPackages, getPackageUpdates } from './packages.js';

export function showHelp() {
  console.log(`
==============================================
       PACKAGE MANAGER CLI v3.0
==============================================

--- LIST & VIEW ---
  list, ls              List all packages
  outdated              Show only outdated
  info <pkg>            Show package details
  deps <pkg>           Show dependencies
  size                 Show package sizes
  which <pkg>          Show install location
  age                  Show install dates
  tree                 Show dependency tree
  find <name>          Find installed package
  group <manager>      Filter by npm/bun/pnpm
  json                 Output as JSON

--- UPDATE & VERSION ---
  check                Check for updates (interactive)
  update               Check for updates
  update <pkg>        Update specific package
  update --all        Update all
  update --major     Update only major versions
  update --minor     Update only minor versions  
  update --patch     Update only patch versions
  install <pkg>[@ver] Install (with version)
  install <url>       Install from GitHub
  uninstall <pkg>     Uninstall package
  downgrade <pkg>@<v> Downgrade to version
  dry-run             Preview updates

--- SEARCH & EXPLORE ---
  search <query>       Search npm
  github <query>       Search GitHub
  npm <pkg>            Quick npm info
  downloads <pkg>      Download stats
  license <pkg>        Show license
  keywords <word>     Search by keyword
  bugs <pkg>          Bug report page
  repo <pkg>          Source repo
  reverse <pkg>       Reverse dependencies
  changelog <pkg>     Show changelog

--- UTILITIES ---
  run <cmd>            Run global CLI
  clean                Clean cache
  doctor               System health
  audit                Security audit
  security             Check vulnerabilities
  stats                Statistics
  export               Export to JSON/CSV
  backup               Backup list
  restore              Restore backup
  logs                 Recent install logs
  duplicates           Find duplicates

--- SPECIAL ---
  link <path>          Link local package
  unlink <pkg>         Unlink package
  star <pkg>           Mark favorite
  favorites            List favorites
  alias <name>=<pkg>  Create alias
  aliases              List aliases
  compare <p1> <p2>    Compare packages

--- SYSTEM ---
  version              Show versions
  help                 This help

==============================================
`);
}

export async function showVersion() {
  console.log('');
  console.log(chalk.cyan('VERSION INFO:'));
  console.log('');

  const node = execSync('node --version', { encoding: 'utf8' }).trim();
  const npm = execSync('npm --version', { encoding: 'utf8' }).trim();
  const pnpm = execSync('pnpm --version', { encoding: 'utf8' }).trim();
  const bun = execSync('bun --version', { encoding: 'utf8' }).trim();
  const git = execSync('git --version', { encoding: 'utf8' }).trim();

  console.log(`Node.js:    ${node}`);
  console.log(`npm:        ${npm}`);
  console.log(`pnpm:       ${pnpm}`);
  console.log(`bun:        ${bun}`);
  console.log(`git:        ${git}`);
  console.log('');
}

export async function showStats() {
  const packages = getAllPackages();
  
  console.log('');
  console.log(chalk.cyan('PACKAGE STATISTICS'));
  console.log(chalk.cyan('=============================================='));
  console.log('');
  
  console.log(`Total Packages: ${packages.length}`);
  
  const npmCount = packages.filter(p => p.Manager === 'npm').length;
  const pnpmCount = packages.filter(p => p.Manager === 'pnpm').length;
  const bunCount = packages.filter(p => p.Manager === 'bun').length;
  
  console.log(`npm:  ${npmCount}`);
  console.log(`pnpm: ${pnpmCount}`);
  console.log(`bun:  ${bunCount}`);
  
  const updates = getPackageUpdates(packages);
  const color = updates.length > 0 ? 'red' : 'green';
  console.log('');
  console.log(chalk[color](`Updates Available: ${updates.length}`));
  console.log('');
}

export async function showDoctor() {
  console.log('');
  console.log(chalk.cyan('SYSTEM HEALTH CHECK'));
  console.log(chalk.cyan('=============================================='));
  console.log('');

  let issues = 0;

  try {
    const node = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(chalk.green('[OK] Node.js: ') + node);
  } catch {
    console.log(chalk.red('[X] Node.js not found'));
    issues++;
  }

  try {
    const npm = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(chalk.green('[OK] npm: ') + npm);
  } catch {
    console.log(chalk.red('[X] npm not found'));
    issues++;
  }

  try {
    const npmPath = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
    console.log(chalk.green('[OK] npm prefix: ') + npmPath);
  } catch {}

  try {
    const cacheDir = execSync('npm config get cache', { encoding: 'utf8' }).trim();
    const size = execSync(`du -sh ${cacheDir}`, { encoding: 'utf8' }).trim();
    console.log(chalk.green('[OK] npm cache: ') + size);
  } catch {}

  console.log('');
  if (issues === 0) {
    console.log(chalk.green('System is healthy!'));
  } else {
    console.log(chalk.red(`Found ${issues} issue(s)`));
  }
  console.log('');
}

export async function showClean() {
  console.log(chalk.yellow('Cleaning npm cache...'));
  try {
    execSync('npm cache clean --force');
    console.log(chalk.green('npm cache cleaned!'));
  } catch {}

  try {
    const bunCache = `${process.env.HOME || process.env.USERPROFILE}/.bun/install/cache`;
    execSync(`rm -rf ${bunCache}`);
    console.log(chalk.green('Bun cache cleaned!'));
  } catch {}
  console.log('');
}

export async function showLogs() {
  console.log('');
  console.log(chalk.cyan('RECENT INSTALL LOGS'));
  console.log(chalk.cyan('=============================================='));
  console.log('');
  console.log(chalk.gray('Check npm cache directory for logs'));
  console.log('');
}

export async function showBackup() {
  const packages = getAllPackages();
  const backup = {
    Date: new Date().toISOString(),
    Packages: packages
  };
  const fs = await import('fs');
  fs.writeFileSync('packages-backup.json', JSON.stringify(backup, null, 2));
  console.log(chalk.green('Backup saved to: packages-backup.json'));
  console.log(chalk.white(`Total: ${packages.length} packages`));
}

export async function showRestore() {
  const fs = await import('fs');
  if (fs.existsSync('packages-backup.json')) {
    const backup = JSON.parse(fs.readFileSync('packages-backup.json', 'utf8'));
    console.log(chalk.yellow(`Backup date: ${backup.Date}`));
    console.log(chalk.white(`Packages: ${backup.Packages.length}`));
    console.log('');
    console.log(chalk.yellow('To restore, run install for each package'));
  } else {
    console.log(chalk.red('No backup found!'));
  }
}

export async function showExport(format?: string) {
  const packages = getAllPackages();
  const fs = await import('fs');
  
  if (format === 'csv') {
    const csv = ['Manager,Name,Version'];
    for (const p of packages) {
      csv.push(`${p.Manager},${p.Name},${p.Version}`);
    }
    fs.writeFileSync('packages-export.csv', csv.join('\n'));
    console.log(chalk.green('Exported to: packages-export.csv'));
  } else {
    fs.writeFileSync('packages-export.json', JSON.stringify(packages, null, 2));
    console.log(chalk.green('Exported to: packages-export.json'));
  }
  console.log(chalk.white(`Total: ${packages.length} packages`));
}

export async function showJson() {
  const packages = getAllPackages();
  console.log(JSON.stringify(packages, null, 2));
}
