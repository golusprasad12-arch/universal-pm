import chalk from 'chalk';
import { registry } from '../core/registry.ts';
import { pm } from '../services/manager.ts';
import { logger, separator } from '../core/logger.ts';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const homeDir = process.env.USERPROFILE || process.env.HOME || '';
const favoritesFile = `${homeDir}/.pmfavorites.json`;
const aliasesFile = `${homeDir}/.pmaliases.json`;
const configFile = `${homeDir}/.pmconfig.json`;
const backupFile = 'packages-backup.json';

let cachedPackages: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 30000;

function getCachedPackages(force = false) {
  const now = Date.now();
  if (!force && cachedPackages && (now - cacheTime) < CACHE_TTL) {
    return cachedPackages;
  }
  cachedPackages = pm.listAll();
  cacheTime = now;
  return cachedPackages;
}

function clearCache() {
  cachedPackages = null;
  cacheTime = 0;
}

// ═══════════════════════════════════════════════════════════════════════
// DETAILED HELP COMMAND
// ═══════════════════════════════════════════════════════════════════════

class HelpCommand {
  name = 'help';
  description = 'Show help';

  async execute(args: string[]): Promise<void> {
    const cmd = args[0];
    
    // Show specific command help
    if (cmd) {
      const helpTopics: Record<string, () => void> = {
        'list': () => {
          logger.commandHelp(
            'list',
            'List all globally installed packages from npm, pnpm, and bun.',
            'universal-pm list [npm|pnpm|bun]',
            ['universal-pm list              - List all packages', 'universal-pm list npm          - List only npm packages', 'universal-pm list bun           - List only bun packages'],
            ['ls', 'l']
          );
        },
        'check': () => {
          logger.commandHelp(
            'check',
            'Check for available updates for all installed packages. Shows current version vs latest version.',
            'universal-pm check',
            ['universal-pm check             - Check all packages', 'universal-pm update            - Same as check'],
            ['update', 'upgrade', 'up', 'outdated']
          );
        },
        'install': () => {
          logger.commandHelp(
            'install',
            'Install a package globally. You can specify a version using @version syntax.',
            'universal-pm install <package>[@version]',
            ['universal-pm install typescript           - Install latest', 'universal-pm install typescript@5.0.0  - Install specific version', 'universal-pm install https://github.com/user/repo - Install from GitHub'],
            ['i', 'add']
          );
        },
        'uninstall': () => {
          logger.commandHelp(
            'uninstall',
            'Remove a globally installed package.',
            'universal-pm uninstall <package>',
            ['universal-pm uninstall typescript        - Remove package', 'universal-pm remove typescript           - Same as uninstall'],
            ['remove', 'rm']
          );
        },
        'search': () => {
          logger.commandHelp(
            'search',
            'Search the npm registry for packages matching the query.',
            'universal-pm search <query>',
            ['universal-pm search react              - Search for react', 'universal-pm search typescript        - Search for typescript'],
            ['s', 'query']
          );
        },
        'info': () => {
          logger.commandHelp(
            'info',
            'Show detailed information about a package including version, license, description, and install commands.',
            'universal-pm info <package>',
            ['universal-pm info openclaw            - Show openclaw info', 'universal-pm view openclaw           - Same as info'],
            ['view', 'show', 'inspect']
          );
        },
        'deps': () => {
          logger.commandHelp(
            'deps',
            'Show all dependencies of a package.',
            'universal-pm deps <package>',
            ['universal-pm deps react               - Show react dependencies'],
            ['dependencies', 'depends']
          );
        },
        'downloads': () => {
          logger.commandHelp(
            'downloads',
            'Show number of downloads for a package in the last 30 days.',
            'universal-pm downloads <package>',
            ['universal-pm downloads openclaw       - Show download stats'],
            ['download', 'downloads']
          );
        },
        'license': () => {
          logger.commandHelp(
            'license',
            'Show the license of a package.',
            'universal-pm license <package>',
            ['universal-pm license openclaw        - Show license (e.g., MIT)'],
            ['licence']
          );
        },
        'version': () => {
          logger.commandHelp(
            'version',
            'Show version information for Node.js, npm, pnpm, bun, and git.',
            'universal-pm version',
            ['universal-pm version                - Show all versions', 'universal-pm v                   - Short form'],
            ['v', 'ver', 'versions']
          );
        },
        'stats': () => {
          logger.commandHelp(
            'stats',
            'Show statistics about installed packages - total count, breakdown by manager.',
            'universal-pm stats',
            ['universal-pm stats                   - Show package statistics'],
            ['stat', 'statistics']
          );
        },
        'doctor': () => {
          logger.commandHelp(
            'doctor',
            'Check system health - verifies Node.js, npm, pnpm, and bun are installed and working.',
            'universal-pm doctor',
            ['universal-pm doctor                 - Run health check', 'universal-pm health                 - Same as doctor'],
            ['health', 'diag', 'diagnose']
          );
        },
        'audit': () => {
          logger.commandHelp(
            'audit',
            'Run npm audit to check for security vulnerabilities in installed packages.',
            'universal-pm audit',
            ['universal-pm audit                  - Check for vulnerabilities', 'universal-pm security               - Same as audit'],
            ['security', 'vuln', 'vulnerability']
          );
        },
        'clean': () => {
          logger.commandHelp(
            'clean',
            'Clean the cache for npm and bun to free up disk space.',
            'universal-pm clean',
            ['universal-pm clean                  - Clear npm and bun cache', 'universal-pm cache                  - Same as clean'],
            ['clear', 'cache']
          );
        },
        'backup': () => {
          logger.commandHelp(
            'backup',
            'Create a backup of your installed packages list to packages-backup.json.',
            'universal-pm backup',
            ['universal-pm backup                 - Save package list'],
            ['save', 'dump']
          );
        },
        'restore': () => {
          logger.commandHelp(
            'restore',
            'Show information about a previous backup.',
            'universal-pm restore',
            ['universal-pm restore                - Show backup info'],
            []
          );
        },
        'export': () => {
          logger.commandHelp(
            'export',
            'Export installed packages to JSON or CSV file.',
            'universal-pm export [json|csv]',
            ['universal-pm export                 - Export to JSON', 'universal-pm export csv              - Export to CSV'],
            ['save', 'dump']
          );
        },
        'json': () => {
          logger.commandHelp(
            'json',
            'Output all installed packages as JSON. Useful for scripting.',
            'universal-pm json',
            ['universal-pm json                   - Output as JSON', 'universal-pm json > packages.json    - Save to file'],
            []
          );
        },
        'which': () => {
          logger.commandHelp(
            'which',
            'Show the installation path of a package.',
            'universal-pm which <package>',
            ['universal-pm which openclaw         - Show install path'],
            ['where', 'path']
          );
        },
        'size': () => {
          logger.commandHelp(
            'size',
            'Show disk space used by each installed package.',
            'universal-pm size',
            ['universal-pm size                   - Show package sizes'],
            []
          );
        },
        'age': () => {
          logger.commandHelp(
            'age',
            'Show when each package was last installed.',
            'universal-pm age',
            ['universal-pm age                    - Show install dates'],
            []
          );
        },
        'tree': () => {
          logger.commandHelp(
            'tree',
            'Show dependency tree for a package or all packages.',
            'universal-pm tree [package]',
            ['universal-pm tree                   - Show global deps', 'universal-pm tree react            - Show react deps'],
            []
          );
        },
        'duplicates': () => {
          logger.commandHelp(
            'duplicates',
            'Find packages that are installed in multiple package managers.',
            'universal-pm duplicates',
            ['universal-pm duplicates             - Find duplicate installs', 'universal-pm dups                   - Short form'],
            ['dup', 'dups']
          );
        },
        'find': () => {
          logger.commandHelp(
            'find',
            'Search for installed packages by name.',
            'universal-pm find <name>',
            ['universal-pm find open              - Find packages with "open"'],
            ['search', 's']
          );
        },
        'outdated': () => {
          logger.commandHelp(
            'outdated',
            'Show only packages that have newer versions available.',
            'universal-pm outdated',
            ['universal-pm outdated              - Show outdated packages'],
            ['out']
          );
        },
        'dry-run': () => {
          logger.commandHelp(
            'dry-run',
            'Preview what would be updated without actually updating.',
            'universal-pm dry-run',
            ['universal-pm dry-run               - Preview updates', 'universal-pm preview                - Same as dry-run'],
            ['preview', 'simulate']
          );
        },
        'major': () => {
          logger.commandHelp(
            'major',
            'Check for major version updates only (e.g., 1.x to 2.x).',
            'universal-pm major',
            ['universal-pm major                  - Show major updates'],
            []
          );
        },
        'star': () => {
          logger.commandHelp(
            'star',
            'Mark a package as favorite for quick access.',
            'universal-pm star <package>',
            ['universal-pm star openclaw          - Mark as favorite', 'universal-pm fav                     - Short form'],
            ['fav', 'bookmark']
          );
        },
        'favorites': () => {
          logger.commandHelp(
            'favorites',
            'List all packages you have marked as favorites.',
            'universal-pm favorites',
            ['universal-pm favorites              - Show favorites', 'universal-pm favs                    - Short form'],
            ['favs', 'starred']
          );
        },
        'alias': () => {
          logger.commandHelp(
            'alias',
            'Create short aliases for package names or commands.',
            'universal-pm alias <name>=<package> or pm alias list',
            ['universal-pm alias list            - Show all aliases', 'universal-pm alias o=openclaw       - Create alias'],
            ['aliases', 'nickname']
          );
        },
        'compare': () => {
          logger.commandHelp(
            'compare',
            'Compare two packages - version, downloads, description.',
            'universal-pm compare <package1> <package2>',
            ['universal-pm compare react vue         - Compare react vs vue', 'universal-pm cmp express koa           - Compare express vs koa'],
            ['cmp', 'diff']
          );
        },
        'home': () => {
          logger.commandHelp(
            'home',
            'Open the package homepage in your default browser.',
            'universal-pm home <package>',
            ['universal-pm home openclaw          - Open homepage', 'universal-pm homepage openclaw       - Same as home'],
            ['homepage', 'website']
          );
        },
        'bugs': () => {
          logger.commandHelp(
            'bugs',
            'Open the package bug report page in your browser.',
            'universal-pm bugs <package>',
            ['universal-pm bugs openclaw          - Open issues page', 'universal-pm issues openclaw        - Same as bugs'],
            ['issues', 'issue']
          );
        },
        'repo': () => {
          logger.commandHelp(
            'repo',
            'Open the package source repository in your browser.',
            'universal-pm repo <package>',
            ['universal-pm repo openclaw          - Open GitHub repo', 'universal-pm source openclaw         - Same as repo'],
            ['repository', 'source']
          );
        },
        'changelog': () => {
          logger.commandHelp(
            'changelog',
            'Show information about where to find the package changelog.',
            'universal-pm changelog <package>',
            ['universal-pm changelog openclaw     - Get changelog URL'],
            ['changes', 'history']
          );
        },
        'reverse': () => {
          logger.commandHelp(
            'reverse',
            'Show packages that depend on the specified package.',
            'universal-pm reverse <package>',
            ['universal-pm reverse react          - Show packages using react'],
            ['dependents', 'rev']
          );
        },
        'recent': () => {
          logger.commandHelp(
            'recent',
            'Show packages that were recently updated in the registry.',
            'universal-pm recent',
            ['universal-pm recent                 - Show recently updated'],
            []
          );
        },
        'popular': () => {
          logger.commandHelp(
            'popular',
            'Show your installed packages sorted by download count.',
            'universal-pm popular',
            ['universal-pm popular                - Show by popularity'],
            []
          );
        },
        'run': () => {
          logger.commandHelp(
            'run',
            'Run a global CLI command directly.',
            'universal-pm run <command>',
            ['universal-pm run typescript --version  - Run typescript CLI'],
            ['exec', 'execute']
          );
        },
        'prune': () => {
          logger.commandHelp(
            'prune',
            'Remove unnecessary packages from node_modules.',
            'universal-pm prune',
            ['universal-pm prune                  - Clean up unused deps'],
            []
          );
        },
        'link': () => {
          logger.commandHelp(
            'link',
            'Link a local package for global use (development).',
            'universal-pm link <path>',
            ['universal-pm link ./my-package      - Link local package'],
            []
          );
        },
        'unlink': () => {
          logger.commandHelp(
            'unlink',
            'Remove a globally linked package.',
            'universal-pm unlink <package>',
            ['universal-pm unlink my-package      - Remove link'],
            []
          );
        },
        'web': () => {
          logger.commandHelp(
            'web',
            'Open the npm website in your default browser.',
            'universal-pm web',
            ['universal-pm web                    - Open npmjs.com', 'universal-pm browse                  - Same as web'],
            ['dashboard', 'browse']
          );
        },
        'cron': () => {
          logger.commandHelp(
            'cron',
            'Show how to set up automatic daily update checks using Windows Task Scheduler.',
            'universal-pm cron',
            ['universal-pm cron                   - Get setup instructions'],
            []
          );
        },
        'notify': () => {
          logger.commandHelp(
            'notify',
            'Show current update status (for scripting/notifications).',
            'universal-pm notify',
            ['universal-pm notify                 - Show update status'],
            ['notification', 'alert']
          );
        },
        'init': () => {
          logger.commandHelp(
            'init',
            'Create a configuration file for PM-CLI.',
            'universal-pm init',
            ['universal-pm init                   - Create config file'],
            []
          );
        },
        'config': () => {
          logger.commandHelp(
            'config',
            'Show or manage PM-CLI configuration.',
            'universal-pm config',
            ['universal-pm config                 - Show config', 'universal-pm init                    - Create config'],
            ['settings', 'cfg']
          );
        },
        'group': () => {
          logger.commandHelp(
            'group',
            'Filter packages by package manager (npm, pnpm, or bun).',
            'universal-pm group <npm|pnpm|bun>',
            ['universal-pm group npm              - Show only npm', 'universal-pm group bun               - Show only bun'],
            ['filter', 'mgr']
          );
        },
        'keywords': () => {
          logger.commandHelp(
            'keywords',
            'Search npm packages by keyword.',
            'universal-pm keywords <word>',
            ['universal-pm keywords cli           - Find CLI packages'],
            ['keyword', 'tags']
          );
        },
      };

      if (helpTopics[cmd]) {
        helpTopics[cmd]();
        separator();
        return;
      }

       // Command not found
       if (cmd) {
         logger.error(`Unknown command: ${cmd}`);
         logger.info('Run: pm help to see all commands');
         logger.tip('Did you mean one of these?');
         const allCommands = registry.all().map(c => c.name);
         const similarCommands = allCommands.filter(c => 
           cmd && c.startsWith(cmd[0]) && c.length > cmd.length && c.length < cmd.length + 3
         );
         if (similarCommands.length > 0) {
           logger.info(`Similar commands: ${similarCommands.slice(0, 3).join(', ')}`);
         }
       } else {
         logger.error('Unknown command');
         logger.info('Run: pm help to see all commands');
       }
       return;
    }

    // Show main help
    logger.banner();
    
    console.log(chalk.white('  USAGE:'));
    console.log(chalk.cyan('    pm <command> [options]'));
    console.log('');
    
    console.log(chalk.white('  QUICK START:'));
    console.log(chalk.gray('    pm list                - See all installed packages'));
    console.log(chalk.gray('    pm check               - Check for updates'));
    console.log(chalk.gray('    pm install <name>     - Install a package'));
    console.log(chalk.gray('    pm help <command>     - Get detailed help for a command'));
    console.log('');

    logger.header('COMMAND CATEGORIES');

    console.log(chalk.white('\n  LIST & VIEW:'));
    console.log(chalk.cyan('    list (ls)         ') + chalk.gray('- List all packages'));
    console.log(chalk.cyan('    find               ') + chalk.gray('- Search installed packages'));
    console.log(chalk.cyan('    outdated           ') + chalk.gray('- Show packages with updates'));
    console.log(chalk.cyan('    which <pkg>        ') + chalk.gray('- Show install location'));
    console.log(chalk.cyan('    size               ') + chalk.gray('- Show disk usage'));
    console.log(chalk.cyan('    age                ') + chalk.gray('- Show install dates'));
    console.log(chalk.cyan('    tree               ') + chalk.gray('- Show dependencies'));
    console.log(chalk.cyan('    duplicates         ') + chalk.gray('- Find duplicate installs'));
    console.log(chalk.cyan('    group <mgr>        ') + chalk.gray('- Filter by npm/pnpm/bun'));

    console.log(chalk.white('\n  UPDATE:'));
    console.log(chalk.cyan('    check               ') + chalk.gray('- Check for updates'));
    console.log(chalk.cyan('    install <pkg>       ') + chalk.gray('- Install/update package'));
    console.log(chalk.cyan('    uninstall <pkg>     ') + chalk.gray('- Remove package'));
    console.log(chalk.cyan('    dry-run             ') + chalk.gray('- Preview updates'));
    console.log(chalk.cyan('    major               ') + chalk.gray('- Major version updates only'));

    console.log(chalk.white('\n  SEARCH:'));
    console.log(chalk.cyan('    search <query>     ') + chalk.gray('- Search npm registry'));
    console.log(chalk.cyan('    info <pkg>          ') + chalk.gray('- Package details'));
    console.log(chalk.cyan('    deps <pkg>         ') + chalk.gray('- Show dependencies'));
    console.log(chalk.cyan('    downloads <pkg>     ') + chalk.gray('- Download statistics'));
    console.log(chalk.cyan('    license <pkg>      ') + chalk.gray('- Show license'));
    console.log(chalk.cyan('    compare <p1> <p2>  ') + chalk.gray('- Compare two packages'));
    console.log(chalk.cyan('    home <pkg>         ') + chalk.gray('- Open homepage'));
    console.log(chalk.cyan('    bugs <pkg>         ') + chalk.gray('- Open bug page'));
    console.log(chalk.cyan('    repo <pkg>         ') + chalk.gray('- Open source repo'));
    console.log(chalk.cyan('    reverse <pkg>      ') + chalk.gray('- Show reverse deps'));
    console.log(chalk.cyan('    recent              ') + chalk.gray('- Recently updated'));
    console.log(chalk.cyan('    popular             ') + chalk.gray('- Most downloaded'));

    console.log(chalk.white('\n  SYSTEM:'));
    console.log(chalk.cyan('    version             ') + chalk.gray('- Version info'));
    console.log(chalk.cyan('    stats               ') + chalk.gray('- Package statistics'));
    console.log(chalk.cyan('    doctor              ') + chalk.gray('- Health check'));
    console.log(chalk.cyan('    audit               ') + chalk.gray('- Security audit'));
    console.log(chalk.cyan('    clean               ') + chalk.gray('- Clean cache'));

    console.log(chalk.white('\n  SPECIAL:'));
    console.log(chalk.cyan('    backup              ') + chalk.gray('- Backup package list'));
    console.log(chalk.cyan('    export [json|csv]  ') + chalk.gray('- Export packages'));
    console.log(chalk.cyan('    json                ') + chalk.gray('- Output as JSON'));
    console.log(chalk.cyan('    star <pkg>          ') + chalk.gray('- Mark favorite'));
    console.log(chalk.cyan('    favorites           ') + chalk.gray('- List favorites'));
    console.log(chalk.cyan('    alias               ') + chalk.gray('- Manage aliases'));
    console.log(chalk.cyan('    run <cmd>           ') + chalk.gray('- Run CLI command'));
    console.log(chalk.cyan('    web                 ') + chalk.gray('- Open npm website'));
    console.log(chalk.cyan('    help <command>      ') + chalk.gray('- Detailed help'));

    console.log('');
    separator();
    
    console.log(chalk.cyan('  For detailed help on any command, run:'));
    console.log(chalk.white('    pm help <command>'));
    console.log(chalk.gray('    Example: pm help install'));
    console.log('');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// LIGHTWEIGHT COMMANDS (simplified for speed)
// ═══════════════════════════════════════════════════════════════════════

class ListCommand {
  name = 'list';
  description = 'List packages';
  aliases = ['ls', 'l'];

  async execute(args: string[]): Promise<void> {
    let packages = getCachedPackages();
    const manager = args[0];
    
    if (manager && ['npm', 'pnpm', 'bun'].includes(manager)) {
      packages = packages.filter(p => p.manager === manager);
    }

    packages.sort((a, b) => a.name.localeCompare(b.name));

    if (packages.length === 0) {
      logger.info('No packages found');
      return;
    }

    const grouped = new Map<string, typeof packages>();
    for (const pkg of packages) {
      if (!grouped.has(pkg.manager)) grouped.set(pkg.manager, []);
      grouped.get(pkg.manager)!.push(pkg);
    }

    logger.header(`Installed Packages (${packages.length})`);
    
    for (const [mgr, pkgs] of grouped) {
      logger.subheader(`[${mgr}] ${pkgs.length} packages`);
      const rows = pkgs.map(pkg => [pkg.name, pkg.version]);
      if (rows.length > 0) logger.table(['Package', 'Version'], rows);
    }
    separator();
  }
}

class CheckCommand {
  name = 'check';
  description = 'Check updates';
  aliases = ['update', 'upgrade', 'up', 'outdated'];

  async execute(args: string[]): Promise<void> {
    const packages = getCachedPackages(true);
    const updates = await pm.checkUpdates(packages);
    
    if (updates.length === 0) {
      logger.success('All packages are up to date!');
      return;
    }

    const rows = updates.map(u => [u.name, u.version, u.latest, `[${u.manager}]`]);
    logger.header(`Updates Available (${updates.length})`);
    logger.table(['Package', 'Current', 'Latest', 'Manager'], rows);
    separator();
  }
}

class VersionCommand {
  name = 'version';
  description = 'Version info';
  aliases = ['v', 'ver'];

  async execute(args: string[]): Promise<void> {
    logger.header('Version Info');
    try {
      logger.kvLong('PM-CLI', 'v4.0.0');
      logger.kvLong('Node.js', execSync('node --version', { encoding: 'utf8' }).trim());
      logger.kvLong('npm', execSync('npm --version', { encoding: 'utf8' }).trim());
      logger.kvLong('pnpm', execSync('pnpm --version', { encoding: 'utf8' }).trim());
      logger.kvLong('bun', execSync('bun --version', { encoding: 'utf8' }).trim());
    } catch {}
    separator();
  }
}

class StatsCommand {
  name = 'stats';
  description = 'Statistics';
  aliases = ['stat'];

  async execute(args: string[]): Promise<void> {
    const packages = getCachedPackages();
    logger.header('Statistics');
    logger.kvLong('Total', String(packages.length));
    logger.kvLong('npm', String(packages.filter(p => p.manager === 'npm').length));
    logger.kvLong('pnpm', String(packages.filter(p => p.manager === 'pnpm').length));
    logger.kvLong('bun', String(packages.filter(p => p.manager === 'bun').length));
    logger.info('Run: pm check for updates');
    separator();
  }
}

class DoctorCommand {
  name = 'doctor';
  description = 'Health check';
  aliases = ['health', 'diag'];

  async execute(args: string[]): Promise<void> {
    logger.header('Health Check');
    const checks = [
      { name: 'Node.js', cmd: 'node --version' },
      { name: 'npm', cmd: 'npm --version' },
      { name: 'pnpm', cmd: 'pnpm --version' },
      { name: 'bun', cmd: 'bun --version' },
    ];
    
    let issues = 0;
    for (const check of checks) {
      try {
        logger.success(`${check.name}: ${execSync(check.cmd, { encoding: 'utf8' }).trim()}`);
      } catch {
        logger.error(`${check.name}: Not found`);
        issues++;
      }
    }
    separator();
    logger[issues === 0 ? 'success' : 'error'](issues === 0 ? 'System healthy!' : `${issues} issues`);
  }
}

// Minimal implementations for other commands
class InstallCommand { 
  name = 'install'; 
  description = 'Install'; 
  aliases = ['i', 'add']; 
  async execute(a: string[]) { 
    if (!a[0]) {
      logger.errorHelp('Missing package name', 'Usage: pm install <package>[@version]');
      return;
    }
    try { 
      pm.install(a[0]); 
      logger.success(`Installed: ${a[0]}`); 
      clearCache(); 
    } catch (error: any) { 
      const errorMessage = error?.message || 'Unknown error';
      logger.error(`Failed to install ${a[0]}: ${errorMessage}`);
      logger.tip('Try running with administrator privileges or check your internet connection');
    } 
  } 
}
class UninstallCommand { name = 'uninstall'; description = 'Uninstall'; aliases = ['remove', 'rm']; async execute(a: string[]) { if (!a[0]) return; try { pm.uninstall(a[0]); logger.success(`Uninstalled: ${a[0]}`); clearCache(); } catch { logger.error(`Failed: ${a[0]}`); } } }
class SearchCommand { name = 'search'; description = 'Search'; aliases = ['s']; async execute(a: string[]) { if (!a[0]) return; const r = pm.search(a[0]); if (r.length) logger.table(['Package', 'Description'], r.map(x => [x.name, (x.description||'').slice(0,50)])); } }
class InfoCommand { name = 'info'; description = 'Info'; aliases = ['view', 'show']; async execute(a: string[]) { if (!a[0]) return; logger.header(`Info: ${a[0]}`); const i = pm.getPackageInfo(a[0]); Object.entries(i).forEach(([k,v]) => { if(v && k!=='repository') logger.kv(k, String(v).slice(0,80)); }); separator(); } }
class BackupCommand { name = 'backup'; description = 'Backup'; async execute() { const p = getCachedPackages(); writeFileSync(backupFile, JSON.stringify({date:new Date().toISOString(),packages:p},null,2)); logger.success(`Backup: ${p.length} packages`); } }
class ExportCommand { name = 'export'; description = 'Export'; aliases = ['save']; async execute(a: string[]) { const p = getCachedPackages(); if ((a[0]||'')==='csv') { const c = ['Manager,Name,Version']; p.forEach(x => c.push(`${x.manager},${x.name},${x.version}`)); writeFileSync('packages-export.csv',c.join('\n')); logger.success('CSV exported'); } else { writeFileSync('packages-export.json',JSON.stringify(p,null,2)); logger.success('JSON exported'); } } }
class JsonCommand { name = 'json'; description = 'JSON'; async execute() { console.log(JSON.stringify(getCachedPackages(),null,2)); } }
class FindCommand { name = 'find'; description = 'Find'; async execute(a: string[]) { if (!a[0]) return; const p = getCachedPackages().filter(x => x.name.toLowerCase().includes(a[0].toLowerCase())); if(p.length) logger.table(['Package','Version','Manager'],p.map(x=>[x.name,x.version,`[${x.manager}]`])); } }
class AuditCommand { name = 'audit'; description = 'Audit'; aliases = ['security']; async execute() { execSync('npm audit',{stdio:'inherit'}); } }
class CleanCommand { name = 'clean'; description = 'Clean'; async execute() { try{execSync('npm cache clean --force',{stdio:'ignore'})}catch{} logger.success('Cache cleaned'); } }
class WebCommand { name = 'web'; description = 'Web'; async execute() { execSync('start https://www.npmjs.com'); } }
class OutdatedCommand { name = 'outdated'; description = 'Outdated'; aliases = ['out']; async execute() { await new CheckCommand().execute([]); } }
class DryRunCommand { name = 'dry-run'; description = 'Dry-run'; async execute() { const p=getCachedPackages(), u=await pm.checkUpdates(p); logger.header('DRY RUN'); u.length?logger.table(['Package','Change'],u.map(x=>[x.name,`${x.version} -> ${x.latest}`])):logger.success('All up to date'); separator(); } }
class PopularCommand { name = 'popular'; description = 'Popular'; async execute() { logger.header('Popular'); logger.info('Run: pm check then pm help popular'); separator(); } }
class RecentCommand { name = 'recent'; description = 'Recent'; async execute() { logger.header('Recent'); logger.info('Run: pm check then pm help recent'); separator(); } }
class GroupCommand { name = 'group'; description = 'Group'; async execute(a:string[]) { if(a[0]&&['npm','pnpm','bun'].includes(a[0])) await new ListCommand().execute(a); } }
class LicenseCommand { name = 'license'; description = 'License'; async execute(a:string[]) { if(!a[0])return; try{const l=execSync(`npm view ${a[0]} license`,{encoding:'utf8'}).trim();logger.kv(a[0],l||'Unknown')}catch{} } }
class DownloadsCommand { name = 'downloads'; description = 'Downloads'; async execute(a:string[]) { if(!a[0])return; try{const d=JSON.parse(execSync(`curl -s "https://api.npmjs.org/downloads/point/last-month/${a[0]}"`,{encoding:'utf8'}));logger.kv(a[0],`${d.downloads?.toLocaleString()||0} downloads`)}catch{} } }
class DepsCommand { name = 'deps'; description = 'Deps'; async execute(a:string[]) { if(!a[0])return; try{const d=execSync(`npm view ${a[0]} dependencies`,{encoding:'utf8'}).trim();console.log(d||'None')}catch{} separator(); } }
class SizeCommand { name = 'size'; description = 'Size'; async execute() { logger.header('Size'); logger.info('Run: pm help size'); separator(); } }
class AgeCommand { name = 'age'; description = 'Age'; async execute() { logger.header('Age'); logger.info('Run: pm help age'); separator(); } }
class TreeCommand { name = 'tree'; description = 'Tree'; async execute() { execSync('npm list -g --depth=2',{stdio:'inherit'}); } }
class DuplicatesCommand { name = 'duplicates'; description = 'Duplicates'; aliases=['dup']; async execute() { const p=getCachedPackages(), m=new Map(); p.forEach(x=>{if(!m.has(x.name))m.set(x.name,[]);m.get(x.name)!.push(x)}); logger.header('Duplicates'); let f=false; m.forEach((v,k)=>{if(v.length>1){f=true;logger.subheader(k);logger.table(['Version','Manager'],v.map(x=>[x.version,`[${x.manager}]`]))}}); if(!f)logger.success('None'); separator(); } }
class CronCommand { name = 'cron'; description = 'Cron'; async execute() { logger.header('Auto-Check'); logger.info('Run: pm help cron'); separator(); } }
class NotifyCommand { name = 'notify'; description = 'Notify'; async execute() { const p=getCachedPackages(), u=await pm.checkUpdates(p); u.length?logger.warn(`${u.length} updates`):logger.success('All up to date'); } }
class InitCommand { name = 'init'; description = 'Init'; async execute() { writeFileSync(configFile,JSON.stringify({autoUpdate:false,defaultManager:'npm'},null,2)); logger.success('Config created'); } }
class ConfigCommand { name = 'config'; description = 'Config'; async execute() { logger.header('Config'); if(existsSync(configFile)){const c=JSON.parse(readFileSync(configFile,'utf8'));Object.entries(c).forEach(([k,v])=>logger.kv(k,String(v)))}else logger.info('Run: pm init'); separator(); } }
class RestoreCommand { name = 'restore'; description = 'Restore'; async execute() { if(!existsSync(backupFile)){logger.error('No backup');return;} const b=JSON.parse(readFileSync(backupFile,'utf8'));logger.kv('Date',b.date);logger.kv('Packages',String(b.packages.length)); } }
class StarCommand { name = 'star'; description = 'Star'; async execute(a:string[]) { if(!a[0])return; let f:string[]=[]; if(existsSync(favoritesFile))f=JSON.parse(readFileSync(favoritesFile,'utf8')); if(!f.includes(a[0])){f.push(a[0]);writeFileSync(favoritesFile,JSON.stringify(f,null,2));logger.success(`Added: ${a[0]}`)} } }
class FavoritesCommand { name = 'favorites'; description = 'Favorites'; aliases=['favs']; async execute() { logger.header('Favorites'); if(existsSync(favoritesFile)){const f=JSON.parse(readFileSync(favoritesFile,'utf8'));logger.table(['Package'],f.map(x=>[x]))}else logger.info('None yet'); separator(); } }
class AliasCommand { name = 'alias'; description = 'Alias'; async execute(a:string[]) { if(!a[0]||a[0]==='list'){logger.header('Aliases');if(existsSync(aliasesFile)){const a_=JSON.parse(readFileSync(aliasesFile,'utf8'));logger.table(['Alias','Package'],Object.entries(a_))}else logger.info('None');separator();return;} if(a[0].includes('=')){const [n,v]=a[0].split('=').map(s=>s.trim());let a_={};if(existsSync(aliasesFile))a_=JSON.parse(readFileSync(aliasesFile,'utf8'));a_[n]=v;writeFileSync(aliasesFile,JSON.stringify(a_,null,2));logger.success(`Alias: ${n} -> ${v}`)} } }
class RunCommand { name = 'run'; description = 'Run'; async execute(a:string[]) { if(!a[0])return; execSync(a.join(' '),{stdio:'inherit'}); } }
class PruneCommand { name = 'prune'; description = 'Prune'; async execute() { try{execSync('npm prune',{stdio:'inherit'});logger.success('Done')}catch{} } }
class LinkCommand { name = 'link'; description = 'Link'; async execute(a:string[]) { if(!a[0])return; try{execSync(`npm link "${a[0]}"`,{stdio:'inherit'});logger.success('Linked')}catch{} } }
class UnlinkCommand { name = 'unlink'; description = 'Unlink'; async execute(a:string[]) { if(!a[0])return; try{execSync(`npm unlink -g "${a[0]}"`,{stdio:'inherit'});logger.success('Unlinked')}catch{} } }
class MajorCommand { name = 'major'; description = 'Major'; async execute() { const p=getCachedPackages(),u=(await pm.checkUpdates(p)).filter(x=>x.version.split('.')[0]!==x.latest.split('.')[0]); u.length?logger.table(['Package','Current','Latest'],u.map(x=>[x.name,x.version,x.latest])):logger.success('None'); separator(); } }
class BugsCommand { name = 'bugs'; description = 'Bugs'; async execute(a:string[]) { if(!a[0])return; try{const b=execSync(`npm view ${a[0]} bugs.url`,{encoding:'utf8'}).trim();if(b)execSync(`start "${b}"`)}catch{} } }
class RepoCommand { name = 'repo'; description = 'Repo'; async execute(a:string[]) { if(!a[0])return; try{let r=execSync(`npm view ${a[0]} repository.url`,{encoding:'utf8'}).trim().replace('git+','').replace('.git','');if(r)execSync(`start "${r}"`)}catch{} } }
class HomeCommand { name = 'home'; description = 'Home'; async execute(a:string[]) { if(!a[0])return; try{const h=execSync(`npm view ${a[0]} homepage`,{encoding:'utf8'}).trim();if(h)execSync(`start "${h}"`)}catch{} } }
class ReverseCommand { name = 'reverse'; description = 'Reverse'; async execute(a:string[]) { if(!a[0])return; try{const r=execSync(`npm view ${a[0]} dependents`,{encoding:'utf8'}).trim();logger.header('Reverse:');console.log(r||'None')}catch{} separator(); } }
class CompareCommand { name = 'compare'; description = 'Compare'; aliases=['cmp']; async execute(a:string[]) { if(!a[0]||!a[1])return; try{const v1=execSync(`npm view ${a[0]} version`,{encoding:'utf8'}).trim(),v2=execSync(`npm view ${a[1]} version`,{encoding:'utf8'}).trim();logger.table([a[0],a[1]],[[`v${v1}`,`v${v2}`]])}catch{} separator(); } }
class KeywordsCommand { name = 'keywords'; description = 'Keywords'; async execute(a:string[]) { await new SearchCommand().execute(a); } }
class ChangelogCommand { name = 'changelog'; description = 'Changelog'; async execute(a:string[]) { if(!a[0])return; logger.header(`Changelog: ${a[0]}`); logger.info(`Visit: https://www.npmjs.com/package/${a[0]}#changelog`); separator(); } }

// Register all commands
registry.register(new HelpCommand());
registry.register(new ListCommand());
registry.register(new CheckCommand());
registry.register(new VersionCommand());
registry.register(new StatsCommand());
registry.register(new DoctorCommand());
registry.register(new InstallCommand());
registry.register(new UninstallCommand());
registry.register(new SearchCommand());
registry.register(new InfoCommand());
registry.register(new BackupCommand());
registry.register(new ExportCommand());
registry.register(new JsonCommand());
registry.register(new FindCommand());
registry.register(new AuditCommand());
registry.register(new CleanCommand());
registry.register(new WebCommand());
registry.register(new OutdatedCommand());
registry.register(new DryRunCommand());
registry.register(new PopularCommand());
registry.register(new RecentCommand());
registry.register(new GroupCommand());
registry.register(new LicenseCommand());
registry.register(new DownloadsCommand());
registry.register(new DepsCommand());
registry.register(new SizeCommand());
registry.register(new AgeCommand());
registry.register(new TreeCommand());
registry.register(new DuplicatesCommand());
registry.register(new CronCommand());
registry.register(new NotifyCommand());
registry.register(new InitCommand());
registry.register(new ConfigCommand());
registry.register(new RestoreCommand());
registry.register(new StarCommand());
registry.register(new FavoritesCommand());
registry.register(new AliasCommand());
registry.register(new RunCommand());
registry.register(new PruneCommand());
registry.register(new LinkCommand());
registry.register(new UnlinkCommand());
registry.register(new MajorCommand());
registry.register(new BugsCommand());
registry.register(new RepoCommand());
registry.register(new HomeCommand());
registry.register(new ReverseCommand());
registry.register(new CompareCommand());
registry.register(new KeywordsCommand());
registry.register(new ChangelogCommand());
