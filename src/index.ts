#!/usr/bin/env bun

import chalk from 'chalk';
import { logger, sep, white, dim, theme as t } from './core/logger.ts';

const colList = chalk.cyan;
const colUpdate = chalk.green;
const colSearch = chalk.magenta;
const colSystem = chalk.yellow;
const colSpecial = chalk.red;
import { registry } from './core/registry.ts';
import { pm } from './services/manager.ts';
import type { Package } from './types/index.ts';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const logCmd = logger.cmd;
const logExample = logger.example;
const logComing = logger.coming;
const logEmpty = logger.empty;

const home = process.env.USERPROFILE || process.env.HOME || '';
const favFile = `${home}/.pmfavorites.json`;
const aliasFile = `${home}/.pmaliases.json`;
const cfgFile = `${home}/.pmconfig.json`;
const backupFile = 'packages-backup.json';

let cache: Package[] = [];
let cacheTime = 0;
const TTL = 30000;

async function pkgs(force = false): Promise<Package[]> {
  const now = Date.now();
  if (!force && cache.length > 0 && now - cacheTime < TTL) return cache;
  cache = await pm.listAll();
  cacheTime = now;
  return cache;
}

function clear() { cache = []; cacheTime = 0; }

// ═══════════════════════════════════════════════════════════════════════
// MAIN HELP - Beautiful and complete
// ═══════════════════════════════════════════════════════════════════════

const helpContent: Record<string, () => void> = {
  '': () => {
    logger.banner();
    
    console.log(`  ${chalk.white.bold('Usage:')} ${chalk.cyan('universal-pm <command> [options]')}`);
    console.log(`  ${chalk.gray('Unified Package Manager for npm, pnpm, and bun')}`);
    console.log('');

    const renderHeader = (title: string, icon: string, color: (s: string) => string) => {
      console.log(`  ${color(chalk.bold(icon + ' ' + title))}`);
      console.log(`  ${chalk.gray('─'.repeat(48))}`);
    };

    renderHeader('LIST & VIEW', '', chalk.red);
    logger.helpEntry('list (ls)', 'List installed packages', 'CORE', 'info');
    logger.helpEntry('find <name>', 'Search installed packages', 'UI', 'info');
    logger.helpEntry('outdated', 'Show packages with updates', 'UPD', 'warning');
    logger.helpEntry('tree [pkg]', 'Display dependency tree');
    logger.helpEntry('stats', 'Package statistics', 'SYS', 'info');
    logger.helpEntry('duplicates', 'Find duplicate packages', 'DUP', 'warning');
    logger.helpEntry('group <mgr>', 'Filter by npm/pnpm/bun');
    logger.helpEntry('sort <type>', 'Sort by name/manager');
    console.log('');
    
    renderHeader('UPDATE & MANAGE', '󰚰', chalk.green);
    logger.helpEntry('check', 'Check for updates', 'AUTO', 'success');
    logger.helpEntry('install <pkg>', 'Install a package', 'CORE', 'info');
    logger.helpEntry('uninstall <pkg>', 'Remove a package', 'CORE', 'info');
    logger.helpEntry('update [pkg]', 'Update packages', 'CORE', 'info');
    logger.helpEntry('major', 'Major version updates', 'UPD', 'warning');
    logger.helpEntry('dry-run', 'Preview updates');
    logger.helpEntry('downgrade <pkg>@v', 'Install specific version');
    console.log('');
    
    renderHeader('SEARCH & INFO', '󰋚', chalk.yellow);
    logger.helpEntry('search <query>', 'Search npm registry', 'WEB', 'info');
    logger.helpEntry('info <pkg>', 'Detailed package info', 'UI', 'info');
    logger.helpEntry('github <query>', 'Search GitHub repos', 'GIT', 'info');
    logger.helpEntry('available <link>', 'Check npm/pnpm/bun', 'NEW', 'success');
    logger.helpEntry('compare <p1> <p2>', 'Compare two packages');
    logger.helpEntry('deps <pkg>', 'Show dependencies');
    logger.helpEntry('downloads <pkg>', 'Download statistics');
    logger.helpEntry('license <pkg>', 'Show license');
    logger.helpEntry('reverse <pkg>', 'Reverse dependencies');
    logger.helpEntry('recent', 'Recently updated');
    logger.helpEntry('popular', 'Most downloaded');
    console.log('');
    
    renderHeader('OPEN LINKS', '󰖟', chalk.blue);
    logger.helpEntry('home <pkg>', 'Open homepage');
    logger.helpEntry('bugs <pkg>', 'Open bug page');
    logger.helpEntry('repo <pkg>', 'Open repository');
    logger.helpEntry('changelog <pkg>', 'View changelog');
    logger.helpEntry('web', 'Open npm website');
    console.log('');
    
    renderHeader('PACKAGE INFO', '󰆄', chalk.magenta);
    logger.helpEntry('which <pkg>', 'Show install location');
    logger.helpEntry('size', 'Disk usage');
    logger.helpEntry('age', 'Install dates');
    logger.helpEntry('version (v)', 'Version info', 'VER', 'info');
    console.log('');
    
    renderHeader('SYSTEM & TOOLS', '', chalk.cyan);
    logger.helpEntry('doctor', 'System health check', 'SYS', 'warning');
    logger.helpEntry('audit', 'Security audit', 'SEC', 'error');
    logger.helpEntry('clean', 'Clean cache');
    logger.helpEntry('backup', 'Save package list', 'DATA', 'success');
    logger.helpEntry('export [json|csv]', 'Export packages');
    logger.helpEntry('json', 'Output as JSON');
    console.log('');
    
    renderHeader('FAVORITES & ALIASES', '★', chalk.yellow);
    logger.helpEntry('star <pkg>', 'Mark favorite');
    logger.helpEntry('favorites (favs)', 'List favorites');
    logger.helpEntry('alias [name=pkg]', 'Manage aliases');
    logger.helpEntry('run <cmd>', 'Run CLI command');
    console.log('');
    
    renderHeader('ADVANCED', '⚡', chalk.red);
    logger.helpEntry('link <path>', 'Link local package');
    logger.helpEntry('unlink <pkg>', 'Remove global link');
    logger.helpEntry('prune', 'Remove unused deps');
    logger.helpEntry('cron', 'Setup auto-check');
    logger.helpEntry('init', 'Create config');
    logger.helpEntry('config', 'Show config');
    logger.helpEntry('restore', 'Show backup info');
    
    console.log('');
    console.log(`  ${chalk.green.bold('» Examples')}`);
    console.log(`  ${chalk.gray('$')} ${chalk.white('pm list')}                       ${chalk.gray('Show all packages')}`);
    console.log(`  ${chalk.gray('$')} ${chalk.white('pm check')}                      ${chalk.gray('Check for updates')}`);
    console.log(`  ${chalk.gray('$')} ${chalk.white('pm install typescript')}          ${chalk.gray('Install package')}`);
    console.log(`  ${chalk.gray('$')} ${chalk.white('pm available react')}            ${chalk.gray('Check npm/pnpm/bun')}`);
    console.log(`  ${chalk.gray('$')} ${chalk.white('pm github typescript cli')}       ${chalk.gray('Search GitHub')}`);
    console.log(`  ${chalk.gray('$')} ${chalk.white('pm info react')}                  ${chalk.gray('View package details')}`);
    
    console.log('');
    console.log(`  ${chalk.gray('Use')} ${chalk.cyan('pm help <command>')} ${chalk.gray('for detailed information.')}`);
    console.log('');
  },
  
  'list': () => {
    console.log(`\n  ${white('pm list')}`);
    console.log(`  ${dim('List all globally installed packages from npm, pnpm, and bun.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm list')} ${dim('[npm|pnpm|bun]')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm list')}`);
    console.log(`  ${dim('pm list bun')}`);
    console.log(`  ${dim('pm ls')}`);
    console.log('');
  },
  
  'install': () => {
    console.log(`\n  ${white('pm install')}`);
    console.log(`  ${dim('Install a package globally. Works with npm, pnpm, and bun.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm install')} ${dim('<package>[@version]')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm install typescript')}`);
    console.log(`  ${dim('pm install typescript@5.0.0')}`);
    console.log(`  ${dim('pm i typescript')}`);
    console.log('');
  },
  
  'check': () => {
    console.log(`\n  ${white('pm check')}`);
    console.log(`  ${dim('Check for available updates for all installed packages.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm check')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm update, pm upgrade, pm outdated')}`);
    console.log('');
  },
  
  'search': () => {
    console.log(`\n  ${white('pm search')}`);
    console.log(`  ${dim('Search the npm registry for packages.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm search')} ${dim('<query>')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm search react')}`);
    console.log('');
  },
  
  'info': () => {
    console.log(`\n  ${white('pm info')}`);
    console.log(`  ${dim('Show detailed information about a package.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm info')} ${dim('<package>')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm view, pm show')}`);
    console.log('');
  },
  
  'uninstall': () => {
    console.log(`\n  ${white('pm uninstall')}`);
    console.log(`  ${dim('Remove a globally installed package.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm uninstall')} ${dim('<package>')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm remove, pm rm')}`);
    console.log('');
  },
  
  'version': () => {
    console.log(`\n  ${white('pm version')}`);
    console.log(`  ${dim('Show version information for Node.js, npm, pnpm, and bun.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm version')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm v, pm ver')}`);
    console.log('');
  },
  
  'stats': () => {
    console.log(`\n  ${white('pm stats')}`);
    console.log(`  ${dim('Show statistics about installed packages.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm stats')}`);
    console.log('');
  },
  
  'doctor': () => {
    console.log(`\n  ${white('pm doctor')}`);
    console.log(`  ${dim('Check system health - verifies all tools are installed.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm doctor')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm health, pm diag')}`);
    console.log('');
  },
  
  'audit': () => {
    console.log(`\n  ${white('pm audit')}`);
    console.log(`  ${dim('Check for security vulnerabilities in packages.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm audit')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm security')}`);
    console.log('');
  },
  
  'clean': () => {
    console.log(`\n  ${white('pm clean')}`);
    console.log(`  ${dim('Clean cache to free up disk space.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm clean')}`);
    console.log('');
  },
  
  'backup': () => {
    console.log(`\n  ${white('pm backup')}`);
    console.log(`  ${dim('Save your package list to a file.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm backup')}`);
    console.log('');
    console.log(`  ${dim('Saves to: packages-backup.json')}`);
    console.log('');
  },
  
  'export': () => {
    console.log(`\n  ${white('pm export')}`);
    console.log(`  ${dim('Export packages to JSON or CSV file.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm export')} ${dim('[json|csv]')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm export json')}`);
    console.log(`  ${dim('pm export csv')}`);
    console.log('');
  },
  
  'find': () => {
    console.log(`\n  ${white('pm find')}`);
    console.log(`  ${dim('Search for installed packages by name.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm find')} ${dim('<name>')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm find open')}`);
    console.log('');
  },
  
  'which': () => {
    console.log(`\n  ${white('pm which')}`);
    console.log(`  ${dim('Show where a package is installed.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm which')} ${dim('<package>')}`);
    console.log('');
  },
  
  'deps': () => {
    console.log(`\n  ${white('pm deps')}`);
    console.log(`  ${dim('Show dependencies of a package.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm deps')} ${dim('<package>')}`);
    console.log('');
  },
  
  'downloads': () => {
    console.log(`\n  ${white('pm downloads')}`);
    console.log(`  ${dim('Show download count for a package (last 30 days).')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm downloads')} ${dim('<package>')}`);
    console.log('');
  },
  
  'license': () => {
    console.log(`\n  ${white('pm license')}`);
    console.log(`  ${dim('Show the license of a package.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm license')} ${dim('<package>')}`);
    console.log('');
  },
  
  'home': () => {
    console.log(`\n  ${white('pm home')}`);
    console.log(`  ${dim('Open package homepage in browser.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm home')} ${dim('<package>')}`);
    console.log('');
  },
  
  'bugs': () => {
    console.log(`\n  ${white('pm bugs')}`);
    console.log(`  ${dim('Open bug report page in browser.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm bugs')} ${dim('<package>')}`);
    console.log('');
  },
  
  'repo': () => {
    console.log(`\n  ${white('pm repo')}`);
    console.log(`  ${dim('Open source repository in browser.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm repo')} ${dim('<package>')}`);
    console.log('');
  },
  
  'compare': () => {
    console.log(`\n  ${white('pm compare')}`);
    console.log(`  ${dim('Compare two packages side by side.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm compare')} ${dim('<pkg1> <pkg2>')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm cmp')}`);
    console.log('');
  },
  
  'star': () => {
    console.log(`\n  ${white('pm star')}`);
    console.log(`  ${dim('Mark a package as favorite.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm star')} ${dim('<package>')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm fav, pm bookmark')}`);
    console.log('');
  },
  
  'favorites': () => {
    console.log(`\n  ${white('pm favorites')}`);
    console.log(`  ${dim('List your favorite packages.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm favorites')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm favs, pm starred')}`);
    console.log('');
  },
  
  'alias': () => {
    console.log(`\n  ${white('pm alias')}`);
    console.log(`  ${dim('Create shortcuts for package names.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm alias')} ${dim('[list|<name>=<package>]')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm aliases')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm alias list')}`);
    console.log(`  ${dim('pm alias o=openclaw')}`);
    console.log('');
  },
  
  'run': () => {
    console.log(`\n  ${white('pm run')}`);
    console.log(`  ${dim('Run a global CLI command.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm run')} ${dim('<command>')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm exec, pm execute')}`);
    console.log('');
  },
  
  'web': () => {
    console.log(`\n  ${white('pm web')}`);
    console.log(`  ${dim('Open npm website in browser.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm web')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm browse, pm dashboard')}`);
    console.log('');
  },
  
  'dry-run': () => {
    console.log(`\n  ${white('pm dry-run')}`);
    console.log(`  ${dim('Preview updates without actually updating.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm dry-run')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm preview, pm simulate')}`);
    console.log('');
  },
  
  'major': () => {
    console.log(`\n  ${white('pm major')}`);
    console.log(`  ${dim('Check for major version updates only.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm major')}`);
    console.log('');
  },
  
  'group': () => {
    console.log(`\n  ${white('pm group')}`);
    console.log(`  ${dim('Filter packages by package manager.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm group')} ${dim('<npm|pnpm|bun>')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm group npm')}`);
    console.log(`  ${dim('pm group bun')}`);
    console.log('');
  },
  
  'size': () => {
    console.log(`\n  ${white('pm size')}`);
    console.log(`  ${dim('Show disk space used by packages.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm size')}`);
    console.log('');
  },
  
  'age': () => {
    console.log(`\n  ${white('pm age')}`);
    console.log(`  ${dim('Show when packages were installed.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm age')}`);
    console.log('');
  },
  
  'tree': () => {
    console.log(`\n  ${white('pm tree')}`);
    console.log(`  ${dim('Show dependency tree.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm tree')} ${dim('[package]')}`);
    console.log('');
  },
  
  'duplicates': () => {
    console.log(`\n  ${white('pm duplicates')}`);
    console.log(`  ${dim('Find packages installed in multiple managers.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm duplicates')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm dup, pm dups')}`);
    console.log('');
  },
  
  'reverse': () => {
    console.log(`\n  ${white('pm reverse')}`);
    console.log(`  ${dim('Show packages that depend on a package.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm reverse')} ${dim('<package>')}`);
    console.log('');
  },
  
  'recent': () => {
    console.log(`\n  ${white('pm recent')}`);
    console.log(`  ${dim('Show recently updated packages.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm recent')}`);
    console.log('');
  },
  
  'popular': () => {
    logger.header('COMMAND: popular');
    console.log('\n  Show packages by download count.');
    console.log('\n  Usage:');
    console.log(white('    pm popular'));
    sep();
  },
  
  'prune': () => {
    logger.header('COMMAND: prune');
    console.log('\n  Remove unused packages.');
    console.log('\n  Usage:');
    console.log(white('    pm prune'));
    sep();
  },
  
  'link': () => {
    logger.header('COMMAND: link');
    console.log('\n  Link local package for development.');
    console.log('\n  Usage:');
    console.log(white('    pm link <path>'));
    sep();
  },
  
  'unlink': () => {
    logger.header('COMMAND: unlink');
    console.log('\n  Remove a global link.');
    console.log('\n  Usage:');
    console.log(white('    pm unlink <package>'));
    sep();
  },
  
  'cron': () => {
    logger.header('COMMAND: cron');
    console.log('\n  Setup automatic daily update checks.');
    console.log('\n  Usage:');
    console.log(white('    pm cron'));
    sep();
  },
  
  'init': () => {
    logger.header('COMMAND: init');
    console.log('\n  Create configuration file.');
    console.log('\n  Usage:');
    console.log(white('    pm init'));
    sep();
  },
  
  'config': () => {
    logger.header('COMMAND: config');
    console.log('\n  Show or manage configuration.');
    console.log('\n  Usage:');
    console.log(white('    pm config'));
    sep();
  },
  
  'restore': () => {
    logger.header('COMMAND: restore');
    console.log('\n  Show backup information.');
    console.log('\n  Usage:');
    console.log(white('    pm restore'));
    sep();
  },
  
  'json': () => {
    logger.header('COMMAND: json');
    console.log('\n  Output packages as JSON (for scripts).');
    console.log('\n  Usage:');
    console.log(white('    pm json'));
    console.log(white('    pm json > file.json   ') + dim('- Save to file'));
    sep();
  },
  
  'changelog': () => {
    logger.header('COMMAND: changelog');
    console.log('\n  Get changelog URL for a package.');
    console.log('\n  Usage:');
    console.log(white('    pm changelog <package>'));
    sep();
  },
  
  'keywords': () => {
    logger.header('COMMAND: keywords');
    console.log('\n  Search packages by keyword.');
    console.log('\n  Usage:');
    console.log(white('    pm keywords <word>'));
    sep();
  },
  
  'notify': () => {
    logger.header('COMMAND: notify');
    console.log('\n  Show current update status.');
    console.log('\n  Usage:');
    console.log(white('    pm notify'));
    sep();
  },

  'update': () => {
    logger.header('COMMAND: update');
    console.log('\n  Update installed packages to latest versions.');
    console.log('\n  Usage:');
    console.log(white('    pm update              ') + dim('- Check for updates'));
    console.log(white('    pm update <package>    ') + dim('- Update specific package'));
    console.log(white('    pm update --major      ') + dim('- Major version updates'));
    console.log(white('    pm update --minor      ') + dim('- Minor version updates'));
    console.log(white('    pm update --patch      ') + dim('- Patch version updates'));
    console.log(white('    pm update --all        ') + dim('- Update all packages'));
    console.log(white('    pm up <package>        ') + dim('- Short form'));
    sep();
  },

  'sort': () => {
    logger.header('COMMAND: sort');
    console.log('\n  Sort packages by name or manager.');
    console.log('\n  Usage:');
    console.log(white('    pm sort              ') + dim('- Sort by name'));
    console.log(white('    pm sort name         ') + dim('- Sort by name'));
    console.log(white('    pm sort manager      ') + dim('- Sort by manager'));
    sep();
  },

  'logs': () => {
    logger.header('COMMAND: logs');
    console.log('\n  View npm cache logs.');
    console.log('\n  Usage:');
    console.log(white('    pm logs'));
    sep();
  },

  'github': () => {
    logger.header('COMMAND: github');
    console.log('\n  Search GitHub repositories.');
    console.log('\n  Usage:');
    console.log(white('    pm github <query>'));
    console.log('\n  Examples:');
    console.log(white('    pm github typescript cli tools'));
    sep();
  },

  'available': () => {
    console.log(`\n  ${white('pm available')}`);
    console.log(`  ${dim('Check if a package is available in npm, pnpm, and bun registries.')}`);
    console.log('');
    console.log(`  ${white('Usage')}`);
    console.log(`  ${dim('pm available')} ${dim('<github-url|package-name>')}`);
    console.log('');
    console.log(`  ${white('Examples')}`);
    console.log(`  ${dim('pm available https://github.com/facebook/react')}`);
    console.log(`  ${dim('pm available facebook/react')}`);
    console.log(`  ${dim('pm available typescript')}`);
    console.log('');
    console.log(`  ${white('Aliases')}`);
    console.log(`  ${dim('pm av, pm checkpkg')}`);
    console.log('');
  },

  'downgrade': () => {
    logger.header('COMMAND: downgrade');
    console.log('\n  Install a specific older version of a package.');
    console.log('\n  Usage:');
    console.log(white('    pm downgrade <package>@<version>'));
    console.log('\n  Example:');
    console.log(white('    pm downgrade typescript@4.9.5'));
    sep();
  },
};

// ═══════════════════════════════════════════════════════════════════════
// COMMAND EXECUTORS
// ═══════════════════════════════════════════════════════════════════════

const commands: Record<string, (args: string[]) => void | Promise<void>> = {
  help: async (args) => {
    const topic = args[0] || '';
    const helpFn = helpContent[topic];
    if (helpFn) {
      helpFn();
    } else {
      // Fallback to main help if topic not found
      // @ts-ignore - helpContent[''] is defined but TS doesn't see it
      helpContent['']();
    }
  },

  list: async (args) => {
    logger.logo('list');
    const mgr = args[0];
    let pk = await pkgs();
    if (mgr && ['npm','pnpm','bun'].includes(mgr)) pk = pk.filter(p => p.manager === mgr);
    pk.sort((a, b) => a.name.localeCompare(b.name));
    
    if (pk.length === 0) { 
      logger.empty('No packages found', 'Install a package with: pm install <name>'); 
      return; 
    }
    
    const counts = {
      npm: pk.filter(p => p.manager === 'npm').length,
      pnpm: pk.filter(p => p.manager === 'pnpm').length,
      bun: pk.filter(p => p.manager === 'bun').length,
    };
    
    console.log('');
    console.log(`  ${chalk.cyan('Total Packages:')} ${chalk.yellow(String(pk.length))}`);
    console.log(`  ${chalk.red('npm:')}   ${chalk.red(String(counts.npm))}`);
    console.log(`  ${chalk.yellow('pnpm:')}  ${chalk.yellow(String(counts.pnpm))}`);
    console.log(`  ${chalk.magenta('bun:')}   ${chalk.magenta(String(counts.bun))}`);
    
    const grouped = new Map();
    for (const p of pk) {
      if (!grouped.has(p.manager)) grouped.set(p.manager, []);
      grouped.get(p.manager)!.push(p);
    }
    
    const mgrColors: Record<string, (s: string) => string> = {
      npm: chalk.red,
      pnpm: chalk.yellow,
      bun: chalk.magenta,
    };
    
    for (const [mgr, list] of grouped) {
      const color = mgrColors[mgr] || t.white;
      console.log('');
      console.log(`  ${color('󰏗 [' + mgr + ']')} ${chalk.white(String((list as any).length) + ' packages')}`);
      logger.table(['Package Name', 'Version'], (list as any).map((p: any) => [p.name, p.version]));
    }
    sep();
  },

  check: async () => {
    logger.logo('check');
    const pk = await pkgs(true);
    
    console.log('');
    const ups = await pm.checkUpdates(pk, (curr, tot, name) => {
      logger.progressBar(curr, tot, `Checking: ${name}`);
    });
    
    // Clear the progress bar line
    process.stdout.write('\r\x1B[2K');
    
    if (ups.length === 0) {
      logger.successBlock('All packages are up to date! 🎉');
      return;
    }
    
    console.log('');
    logger.summary([
      {label: 'Updates Available', value: String(ups.length), color: t.highlight},
    ]);
    
    console.log('');
    logger.table(
      ['Package Name', 'Current', 'Latest', 'Manager'],
      ups.map(u => [u.name, u.version, u.latest, `[${u.manager}]`])
    );
    
    console.log('');
    logger.tip('To update all packages, run: pm update --all');
    logger.tip('To update a specific package, run: pm update <package>');
    sep();
  },

  version: async () => {
    logger.logo('version');
    console.log('');
    
    logger.summary([
      {label: 'PM CLI Core', value: 'v4.0.0', color: t.success},
      {label: 'Runtime', value: 'Bun ' + process.versions.bun, color: t.manager},
      {label: 'OS', value: process.platform, color: t.info},
    ]);
    
    const tools = [
      { name: 'Node.js', cmd: 'node --version', icon: '' },
      { name: 'npm', cmd: 'npm --version', icon: '󰏗' },
      { name: 'pnpm', cmd: 'pnpm --version', icon: '󰏗' },
      { name: 'bun', cmd: 'bun --version', icon: '󰏗' },
      { name: 'git', cmd: 'git --version', icon: '󰊤' }
    ];
    
    console.log('');
    logger.title('Dependency Stack');
    
    for (const tool of tools) {
      try {
        const ver = execSync(tool.cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
        logger.kvIcon(tool.icon, tool.name, ver, t.white);
      } catch {
        logger.kvIcon(tool.icon, tool.name, 'Not installed', t.dim);
      }
    }
    sep();
  },

  stats: async () => {
    logger.logo('stats');
    const pk = await pkgs();
    const npmCount = pk.filter(p => p.manager === 'npm').length;
    const pnpmCount = pk.filter(p => p.manager === 'pnpm').length;
    const bunCount = pk.filter(p => p.manager === 'bun').length;
    
    console.log('');
    logger.summary([
      {label: 'Total Packages', value: String(pk.length), color: t.number},
    ]);
    
    console.log('');
    logger.title('Manager Breakdown');
    
    const total = pk.length || 1;
    logger.progressBar(npmCount, total, `npm (${npmCount})`);
    logger.progressBar(pnpmCount, total, `pnpm (${pnpmCount})`);
    logger.progressBar(bunCount, total, `bun (${bunCount})`);
    
    console.log('');
    logger.tip('Run: pm check to see which of these have updates');
    sep();
  },

  doctor: async () => {
    logger.logo('doctor');
    const tools = [
      { n: 'Node.js', c: 'node --version' },
      { n: 'npm', c: 'npm --version' },
      { n: 'pnpm', c: 'pnpm --version' },
      { n: 'bun', c: 'bun --version' },
      { n: 'git', c: 'git --version' }
    ];
    let ok = 0;
    
    console.log('');
    logger.title('Environment Check');
    
    for (const t of tools) {
      try { 
        const ver = execSync(t.c, { encoding: 'utf8', stdio: 'pipe' }).trim(); 
        logger.status('success', `${t.n.padEnd(8)}: ${ver}`); 
        ok++; 
      }
      catch { 
        logger.status('error', `${t.n.padEnd(8)}: Not found`); 
      }
    }
    
    console.log('');
    logger.title('Permissions & Paths');
    try {
      const npmPrefix = execSync('npm config get prefix', { encoding: 'utf8', stdio: 'pipe' }).trim();
      logger.kvIcon('󱂚', 'npm Prefix', npmPrefix, logger.path);
    } catch {}

    try {
      const bunBin = execSync('bun pm bin -g', { encoding: 'utf8', stdio: 'pipe' }).trim();
      logger.kvIcon('󱂚', 'Bun Bin', bunBin, logger.path);
    } catch {}
    
    console.log('');
    if (ok >= 4) {
      logger.successBlock('System health: EXCELLENT', [
        'All essential package managers are correctly installed and responsive.',
        'You are ready to manage your packages effectively.'
      ]);
    } else if (ok >= 2) {
      logger.warnBlock('System health: FAIR', [
        `${ok}/${tools.length} tools detected.`,
        'Some package managers are missing but the CLI will still function for the ones available.'
      ]);
    } else {
      logger.errorBlock('System health: POOR', [
        'Most package management tools are missing.',
        'Please install Node.js, npm, pnpm, or Bun to use this CLI effectively.'
      ]);
    }
    sep();
  },

  install: async (args) => {
    const target = args[0];
    if (!target) { logger.errorHelp('Usage: pm install <package> or <github-url>'); return; }
    
    if (target.includes('github.com')) {
      logger.logo('install');
      logger.status('running', 'Installing from GitHub: ' + target);
      
       const match = target.match(/github\.com\/([^\/]+)\/([^\/]+)/);
       if (match) {
         let owner = match[1] ?? '';
         let repo = (match[2] ?? '').replace('.git', '');
         
         owner = owner.replace(/[^a-zA-Z0-9-_]/g, '');
         repo = repo.replace(/[^a-zA-Z0-9-_]/g, '');
         
         if (!owner || !repo) {
           logger.errorBlock('Invalid GitHub URL format');
           return;
         }
        
        try {
          const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
          const info = JSON.parse(execSync(`curl -s "${url}"`, { encoding: 'utf8', stdio: 'pipe' }));
          console.log('');
          logger.summary([
            {label: 'Repository', value: info.full_name, color: logger.pkg},
            {label: 'Stars', value: String(info.stargazers_count), color: logger.stars},
            {label: 'Language', value: info.language || 'N/A', color: logger.lang},
            {label: 'License', value: info.license?.name || 'N/A', color: logger.lic},
          ]);
        } catch (err) {
          console.log('');
          logger.info('Could not fetch repo info from GitHub API');
        }
        
        console.log('');
        logger.label('Install Commands:');
        logger.cmdHighlight('npm install -g ' + target);
        logger.cmdHighlight('bun add ' + owner + '/' + repo);
        logger.cmdHighlight('pnpm add ' + owner + '/' + repo);
        console.log('');
      } else {
        logger.errorBlock('Invalid GitHub URL format');
        return;
      }
      
      try { 
        pm.install(target); 
        logger.successBlock('Installed: ' + target); 
        clear(); 
      }
      catch (err) { 
        logger.errorBlock('Failed to install: ' + target); 
        console.error(err); 
      }
    } else {
      logger.logo('install');
      logger.status('running', 'Installing: ' + target);
      try { 
        pm.install(target); 
        logger.successBlock('Installed: ' + target); 
        clear(); 
      }
      catch (err) { 
        logger.errorBlock('Failed to install: ' + target); 
        console.error(err); 
      }
    }
  },

  uninstall: async (args) => {
    logger.logo('uninstall');
    if (!args[0]) { logger.errorHelp('Usage: pm uninstall <package>'); return; }
    try { 
      pm.uninstall(args[0]); 
      logger.successBlock('Uninstalled: ' + args[0]); 
      clear(); 
    }
    catch { 
      logger.errorBlock('Failed to uninstall: ' + args[0]); 
    }
  },

  search: async (args) => {
    if (!args[0]) { logger.errorHelp('Usage: pm search <query>'); return; }
    const query = args.join(' ');
    
    logger.logo('search');
    const stopSpinner = logger.spinner('Searching npm for "' + query + '"...');
    
    try {
      const results = pm.search(query);
      stopSpinner();
      
      if (results.length > 0) {
        console.log('');
        logger.table(
          ['No.', 'Package Name', 'Description'],
          results.slice(0, 15).map((x, i) => [
            String(i + 1),
            x.name,
            (x.description || '').slice(0, 60) + (x.description && x.description.length > 60 ? '...' : '')
          ])
        );
        console.log('');
        logger.tip('Run: pm info <package> to see details');
      } else {
        logger.empty('No packages found matching "' + query + '"');
      }
    } catch (err) {
      stopSpinner();
      logger.error('Search failed: ' + (err as any).message);
    }
    sep();
  },

  info: async (args) => {
    if (!args[0]) { logger.errorHelp('Usage: pm info <package>'); return; }
    const pkg = args[0];
    
    logger.logo('info');
    const stopSpinner = logger.spinner('Fetching info for "' + pkg + '"...');
    
    const safeNpmView = (field: string): string => {
      try {
        return execSync(`npm view ${pkg} ${field}`, { encoding: 'utf8', stdio: 'pipe' }).trim() || 'N/A';
      } catch {
        return 'N/A';
      }
    };
    
    try {
      const ver = safeNpmView('version');
      if (ver === 'N/A') {
        stopSpinner();
        logger.empty('Package "' + pkg + '" not found in npm registry');
        return;
      }
      
      const license = safeNpmView('license');
      const desc = safeNpmView('description');
      const homepage = safeNpmView('homepage');
      const repo = safeNpmView('repository.url').replace('git+','').replace('.git','');
      const deprecated = safeNpmView('deprecated');
      
      let downloads = 'Unknown';
      try {
        const d = JSON.parse(execSync(`curl -s "https://api.npmjs.org/downloads/point/last-month/${pkg}"`, { encoding: 'utf8', stdio: 'pipe' }));
        if (d?.downloads) downloads = d.downloads.toLocaleString() + ' (30 days)';
      } catch {}
      
      stopSpinner();
      console.log('');
      
      logger.summary([
        {label: 'Package', value: pkg, color: logger.pkg},
        {label: 'Version', value: ver, color: logger.ver},
        {label: 'Downloads', value: downloads, color: logger.num},
      ]);
      
      console.log('');
      if (deprecated && deprecated !== 'N/A') {
        logger.errorBlock('DEPRECATED', [deprecated]);
      }
      
      logger.infoBlock('Details', [
        desc !== 'N/A' ? desc : 'No description available',
      ]);
      
      console.log('');
      logger.kvIcon('', 'License', license, logger.lic);
      logger.kvIcon('󰖟', 'Homepage', homepage !== 'N/A' ? homepage : 'None', logger.url);
      logger.kvIcon('󰊤', 'Repository', repo !== 'N/A' ? repo : 'None', logger.url);
      
      console.log('');
      logger.subheader('Install Commands');
      logger.cmdHighlight('pm install ' + pkg);
      logger.cmdHighlight('bun add ' + pkg);
      logger.cmdHighlight('npm i -g ' + pkg);
      
    } catch (err) {
      stopSpinner();
      logger.error('Failed to get info: ' + (err as any).message);
    }
    sep();
  },

    find: async (args) => {
      logger.logo('find');
      if (!args[0]) { logger.errorHelp('Usage: pm find <name>'); return; }
      const allPkgs = await pkgs();
      const f = allPkgs.filter(p => p.name.toLowerCase().includes(args[0].toLowerCase()));
      if (f.length) logger.table(['Package','Version','Manager'], f.map(p => [p.name,p.version,'['+p.manager+']']));
      else logEmpty('No packages match "' + args[0] + '"', 'Try a different search term');
    },

  backup: async () => {
    logger.logo('backup');
    const all = await pkgs();
    writeFileSync(backupFile, JSON.stringify({date:new Date().toISOString(),packages:all},null,2));
    logger.success('Backup saved: ' + all.length + ' packages');
  },

  export: async (args) => {
    logger.logo('export');
    const p = await pkgs();
    const f = args[0]==='csv';
    if (f) {
      const c = ['Manager,Name,Version'];
      p.forEach(x => c.push(`${x.manager},${x.name},${x.version}`));
      writeFileSync('packages-export.csv',c.join('\n'));
    } else writeFileSync('packages-export.json',JSON.stringify(p,null,2));
    logger.success(f?'CSV exported':'JSON exported');
  },

  json: async () => console.log(JSON.stringify(await pkgs(), null, 2)),

   audit: async () => { execSync('npm audit', {stdio:'inherit'}); },

  clean: async () => {
    try { execSync('npm cache clean --force', {stdio:'ignore'}); } catch {}
    logger.success('Cache cleaned');
  },

   web: async () => { execSync('start https://www.npmjs.com'); },

  outdated: async () => await commands.check([]),

  dryRun: async () => {
    logger.logo('dryRun');
    const p = await pkgs(), u = await pm.checkUpdates(p);
    if (!u.length) { logger.success('All up to date'); return; }
    logger.table(['Package','Change'], u.map(x => [x.name, x.version + ' -> ' + x.latest]));
    sep();
  },

  star: async (args) => {
    if (!args[0]) { logger.errorHelp('Usage: pm star <package>'); return; }
    let f: string[] = [];
    if (existsSync(favFile)) f = JSON.parse(readFileSync(favFile,'utf8'));
    if (!f.includes(args[0])) { f.push(args[0]); writeFileSync(favFile,JSON.stringify(f)); logger.success('Added: ' + args[0]); }
    else logger.warn('Already in favorites');
  },

  favorites: async () => {
    logger.logo('favorites');
    if (existsSync(favFile)) logger.table(['Package'], JSON.parse(readFileSync(favFile,'utf8')).map((x: string) => [x]));
    else logEmpty('No favorites yet', 'Add favorites with: pm star <package>');
    sep();
  },

     alias: async (args) => {
      logger.logo('alias');
      if (!args[0] || args[0] === 'list') {
        if (existsSync(aliasFile)) {
          const content = readFileSync(aliasFile, 'utf8').replace(/^\uFEFF/, '');
          logger.table(['Alias', 'Package'], Object.entries(JSON.parse(content)));
        }
        else logEmpty('No aliases yet', 'Create an alias: pm alias <name>=<package>');
        sep();
        return;
      }
     if (args[0].includes('=')) {
       const [a, b] = args[0].split('=').map(s => s.trim());
       let m: any = {};
       if (existsSync(aliasFile)) m = JSON.parse(readFileSync(aliasFile, 'utf8'));
       m[a] = b; writeFileSync(aliasFile, JSON.stringify(m));
       logger.success('Alias: ' + a + ' -> ' + b);
     }
   },

  run: async (args) => { if(args[0]) execSync(args.join(' '), {stdio:'inherit'}); },

  init: async () => writeFileSync(cfgFile, JSON.stringify({autoUpdate:false,defaultManager:'npm'},null,2)) || logger.success('Config created'),

   config: async () => {
     logger.logo('config');
     if (existsSync(cfgFile)) Object.entries(JSON.parse(readFileSync(cfgFile, 'utf8'))).forEach(([k, v]) => logger.kv(k, String(v)));
     else logger.info('Run: pm init');
     sep();
   },

  compare: async (args) => {
    logger.logo('compare');
    if (!args[0] || !args[1]) { logger.errorHelp('Usage: pm compare <pkg1> <pkg2>'); return; }
    try {
      const v1 = execSync(`npm view ${args[0]} version`,{encoding:'utf8'}).trim();
      const v2 = execSync(`npm view ${args[1]} version`,{encoding:'utf8'}).trim();
      logger.table([args[0], args[1]], [[v1, v2]]);
    } catch {}
  },

  license: async (args) => { if(args[0]) logger.kv(args[0], (execSync(`npm view ${args[0]} license`,{encoding:'utf8'}).trim() || 'Unknown')); },

  downloads: async (args) => {
    if (!args[0]) return;
    try {
      const d = JSON.parse(execSync(`curl -s "https://api.npmjs.org/downloads/point/last-month/${args[0]}"`,{encoding:'utf8'}));
      logger.kv(args[0], (d.downloads||0).toLocaleString() + ' downloads (30 days)');
    } catch {}
  },

  deps: async (args) => { if(args[0]) console.log(execSync(`npm view ${args[0]} dependencies`,{encoding:'utf8'}).trim() || 'None'); },

  home: async (args) => { if(args[0]) { const h = execSync(`npm view ${args[0]} homepage`,{encoding:'utf8'}).trim(); if(h) execSync(`start "${h}"`); } },

  bugs: async (args) => { if(args[0]) { const b = execSync(`npm view ${args[0]} bugs.url`,{encoding:'utf8'}).trim(); if(b) execSync(`start "${b}"`); } },

  repo: async (args) => { if(args[0]) { let r = execSync(`npm view ${args[0]} repository.url`,{encoding:'utf8'}).trim().replace('git+','').replace('.git',''); if(r) execSync(`start "${r}"`); } },

  // Package Size
  size: async () => {
    logger.logo('size');
    const pk = pkgs();
    const loc = execSync('npm root -g', {encoding:'utf8'}).trim();
    logger.kv('Location', loc);
    logger.kv('Total Packages', String(pk.length));
    sep();
    logger.info('Package size checking not available on Windows');
    logger.tip('Use your file explorer to check node_modules size');
  },

  // Package Age/Install Date
  age: async () => {
    logger.logo('age');
    const pk = pkgs();
    const loc = execSync('npm root -g', {encoding:'utf8'}).trim();
    logger.kv('Location', loc);
    logger.kv('Total Packages', String(pk.length));
    sep();
    logger.info('Install date tracking not available');
    logger.tip('Packages are installed globally and do not track install dates');
  },

  // Which - show package location
  which: async (args) => {
    if (!args[0]) { logger.errorHelp('Usage: pm which <package>'); return; }
    const loc = execSync('npm root -g', {encoding:'utf8'}).trim();
    logger.logo('which');
    logger.kv('Package', args[0]);
    logger.kv('Location', loc);
    console.log('');
    console.log('  ' + logger.path(loc + '/' + args[0]));
    sep();
  },

  // Sort - sort packages
  sort: async (args) => {
    const type = args[0] || 'name';
    let pk = await pkgs();
    
    if (type === 'name') {
      pk.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'manager') {
      pk.sort((a, b) => a.manager.localeCompare(b.manager));
    }
    
    logger.logo('list');
    logger.kv('Sorted by', type);
    logger.kv('Total', String(pk.length));
    console.log('');
    
    // Show grouped by manager
    const grouped = new Map();
    pk.forEach(p => {
      if (!grouped.has(p.manager)) grouped.set(p.manager, []);
      grouped.get(p.manager)!.push(p);
    });
    
    for (const [mgr, list] of grouped) {
      logger.subheader('[' + mgr + '] ' + (list as any).length + ' packages');
      logger.table(['Package', 'Version'], (list as any).map((p: any) => [p.name, p.version]));
    }
    sep();
  },

  // Group - filter by manager
  group: async (args) => {
    const mgr = args[0];
    let pk = await pkgs();
    
    if (mgr && ['npm', 'pnpm', 'bun'].includes(mgr)) {
      pk = pk.filter(p => p.manager === mgr);
    }
    
    pk.sort((a, b) => a.name.localeCompare(b.name));
    
    logger.logo('group');
    logger.kv('Filter', mgr || 'all');
    logger.kv('Total', String(pk.length));
    console.log('');
    logger.table(['Package', 'Version', 'Manager'], pk.map(p => [p.name, p.version, '[' + p.manager + ']']));
    sep();
  },

  tree: async (args) => {
    if (args[0]) {
      logger.logo('tree');
      console.log(execSync(`npm view ${args[0]} dependencies`, {encoding:'utf8', stdio:'inherit'}));
    } else {
      execSync('npm list -g --depth=2',{stdio:'inherit'});
    }
  },

  // Reverse Dependencies
  reverse: async (args) => {
    logger.logo('reverse');
    if (!args[0]) { logger.errorHelp('Usage: pm reverse <package>'); return; }
    const result = execSync(`npm view ${args[0]} dependents`, {encoding:'utf8'}).trim();
    if (result) {
      console.log(result);
    } else {
      logger.info('No reverse dependencies found');
    }
    sep();
  },

  // Changelog
  changelog: async (args) => {
    logger.logo('changelog');
    if (!args[0]) { logger.errorHelp('Usage: pm changelog <package>'); return; }
    const url = execSync(`npm view ${args[0]} homepage`, {encoding:'utf8'}).trim();
    if (url) {
      logger.kv('Homepage', url);
      logger.info('Opening changelog...');
      execSync(`start "${url}#changelog"`);
    } else {
      logger.info('No homepage/changelog found');
    }
    sep();
  },

  // GitHub Search
  github: async (args) => {
    logger.logo('github');
    if (!args[0]) { logger.errorHelp('Usage: pm github <query>'); return; }
    logger.info('Searching GitHub for: ' + args[0]);
    const result = execSync(`curl -s "https://api.github.com/search/repositories?q=${encodeURIComponent(args[0])}&per_page=10"`, {encoding:'utf8'});
    const data = JSON.parse(result);
    if (data.items && data.items.length > 0) {
      logger.kv('Found', String(data.items.length) + ' repositories');
      console.log('');
      data.items.forEach((r: any, i: number) => {
        console.log(`  ${i+1}. ${logger.pkg(r.full_name)}`);
        console.log(`     Stars: ${logger.num(String(r.stargazers_count))} | Lang: ${logger.label(r.language || 'N/A')}`);
      });
    } else {
      logger.info('No results found');
    }
    sep();
  },

  // Check package availability across npm, pnpm, bun
  available: async (args) => {
    const target = args[0];
    if (!target) { logger.errorHelp('Usage: pm available <github-url|package-name>'); return; }
    
    logger.logo('available');
    console.log('');
    
    let pkgName = '';
    let repoInfo: any = null;
    
    if (target.includes('github.com')) {
      const match = target.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const owner = match[1];
        const repo = match[2].replace('.git', '');
        pkgName = repo;
        
        logger.label('GitHub Repository:');
        console.log(`  ${logger.pkg(owner + '/' + repo)}`);
        
        try {
          const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
          const res = execSync(`curl -s "${url}"`, { encoding: 'utf8', stdio: 'pipe' });
          repoInfo = JSON.parse(res);
        } catch {}
      }
    } else if (target.includes('/')) {
      const [owner, repo] = target.split('/');
      pkgName = repo;
      try {
        const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
        const res = execSync(`curl -s "${url}"`, { encoding: 'utf8', stdio: 'pipe' });
        repoInfo = JSON.parse(res);
      } catch {}
    } else {
      pkgName = target;
    }
    
    console.log('');
    logger.label('Checking availability...');
    console.log('');
    
    const checkNpm = (name: string): { available: boolean; version?: string } => {
      try {
        const v = execSync(`npm view ${name} version`, { encoding: 'utf8', stdio: 'pipe' }).trim();
        if (v) return { available: true, version: v };
      } catch {}
      return { available: false };
    };
    
    const checkPnpm = async (name: string): Promise<{ available: boolean; version?: string }> => {
      try {
        const v = execSync(`pnpm view ${name} version`, { encoding: 'utf8', stdio: 'pipe' }).trim();
        if (v) return { available: true, version: v };
      } catch {}
      return { available: false };
    };
    
    const checkBun = (name: string): { available: boolean; version?: string } => {
      try {
        const v = execSync(`curl -s "https://registry.npmjs.org/${name}/latest"`, { encoding: 'utf8', stdio: 'pipe' });
        const data = JSON.parse(v);
        if (data.version) return { available: true, version: data.version };
      } catch {}
      return { available: false };
    };
    
    const npmResult = checkNpm(pkgName);
    const pnpmResult = await checkPnpm(pkgName);
    const bunResult = checkBun(pkgName);
    
    console.log(`  ${t.bold('Package:')} ${logger.pkg(pkgName)}`);
    console.log('');
    
    const tableData = [
      ['npm', npmResult.available ? '✓ Available' : '✗ Not found', npmResult.version || '-'],
      ['pnpm', pnpmResult.available ? '✓ Available' : '✗ Not found', pnpmResult.version || '-'],
      ['bun', bunResult.available ? '✓ Available' : '✗ Not found', bunResult.version || '-'],
    ];
    logger.table(['Manager', 'Status', 'Version'], tableData);
    
    if (repoInfo) {
      console.log('');
      logger.label('GitHub Info:');
      console.log(`    ${t.dim('Stars:')} ${logger.num(String(repoInfo.stargazers_count))}`);
      console.log(`    ${t.dim('Language:')} ${logger.lang(repoInfo.language || 'N/A')}`);
      console.log(`    ${t.dim('License:')} ${logger.lic(repoInfo.license?.name || 'N/A')}`);
    }
    
    const availableCount = [npmResult, pnpmResult, bunResult].filter(r => r.available).length;
    console.log('');
    if (availableCount > 0) {
      logger.successBlock(`${availableCount}/3 package managers have this package`);
      console.log('');
      logger.label('Install Commands:');
      if (npmResult.available) logger.cmdHighlight('npm install -g ' + pkgName);
      if (pnpmResult.available) logger.cmdHighlight('pnpm add -g ' + pkgName);
      if (bunResult.available) logger.cmdHighlight('bun add -g ' + pkgName);
    } else {
      logger.warnBlock('Package not found in any registry', [
        'The package may have a different name on npm',
        'Try searching: pm search ' + pkgName
      ]);
    }
    sep();
  },

  // Downgrade
  downgrade: async (args) => {
    logger.logo('downgrade');
    if (!args[0]) { logger.errorHelp('Usage: pm downgrade <package>@<version>'); return; }
    logger.info('Installing: ' + args[0]);
    try {
      execSync(`npm install -g ${args[0]}`, {stdio:'inherit'});
      logger.success('Installed: ' + args[0]);
    } catch {
      logger.error('Failed to install: ' + args[0]);
    }
  },

  // Logs
  logs: async () => {
    logger.logo('logs');
    const logPath = process.env.APPDATA + '\\npm-cache\\_logs';
    logger.info('Checking logs in: npm-cache');
    try {
      const files = execSync(`ls -t "${logPath}" 2>/dev/null | head -5`, {encoding:'utf8'}).trim().split('\n');
      if (files && files[0]) {
        files.forEach((f: string) => {
          if (f) logger.label(f.trim());
        });
      } else {
        logger.info('No logs found');
      }
    } catch {
      logger.info('No logs found');
    }
    sep();
  },

  // Update with flags
  update: async (args) => {
    const flag = args[0];
    if (flag === '--major') {
      await commands.major([]);
    } else if (flag === '--minor') {
      logger.logo('check');
      const pk = await pkgs(true);
      const ups = (await pm.checkUpdates(pk)).filter((x: any) => {
        const cv = x.version.split('.')[0];
        const lv = x.latest.split('.')[0];
        return cv === lv;
      });
      if (ups.length === 0) { logger.success('No minor updates'); return; }
      logger.kv('Minor Updates', String(ups.length));
      logger.table(['Package','Current','Latest'], ups.map((x: any)=>[x.name, x.version, x.latest]));
      sep();
    } else if (flag === '--patch') {
      logger.logo('check');
      const pk = await pkgs(true);
      const ups = (await pm.checkUpdates(pk)).filter((x: any) => {
        const cv = x.version.split('.').slice(0,2).join('.');
        const lv = x.latest.split('.').slice(0,2).join('.');
        return cv === lv;
      });
      if (ups.length === 0) { logger.success('No patch updates'); return; }
      logger.kv('Patch Updates', String(ups.length));
      logger.table(['Package','Current','Latest'], ups.map((x: any)=>[x.name, x.version, x.latest]));
      sep();
    } else if (flag === '--all') {
      await commands.check([]);
    } else if (flag) {
      logger.logo('install');
      logger.info('Updating: ' + flag);
      try {
        execSync(`npm install -g ${flag}`, {stdio:'inherit'});
        logger.success('Updated: ' + flag);
        clear();
      } catch {
        logger.error('Failed to update: ' + flag);
      }
    } else {
      await commands.check([]);
    }
  },

   duplicates: async () => {
     logger.logo('duplicates');
     const p = await pkgs(), m = new Map();
     p.forEach(x => { if(!m.has(x.name)) m.set(x.name,[]); m.get(x.name)!.push(x); });
     let f = false;
     m.forEach((v,k) => { if(v.length>1) { f=true; logger.subheader(k); logger.table(['Version','Manager'], v.map((x:any)=>[x.version,'['+x.manager+']'])); } });
     if(!f) logger.success('No duplicates');
     sep();
   },

  major: async () => {
    logger.logo('major');
    const p = await pkgs(), u = (await pm.checkUpdates(p)).filter(x => x.version.split('.')[0]!==x.latest.split('.')[0]);
    if(u.length) logger.table(['Package','Current','Latest'], u.map(x=>[x.name,x.version,x.latest]));
    else logger.success('No major updates');
    sep();
  },

  cron: async () => { logger.logo('cron'); logger.info('Run as Admin:'); console.log('  schtasks /create /tn "PMP-AutoUpdate" /tr "bun run pm check" /sc daily /st 09:00'); sep(); },

  notify: async () => await commands.check([]),

  prune: async () => { try { execSync('npm prune',{stdio:'inherit'}); logger.success('Done'); } catch {} },

  link: async (args) => { if(args[0]) try { execSync(`npm link "${args[0]}"`,{stdio:'inherit'}); logger.success('Linked'); } catch {} },

  unlink: async (args) => { if(args[0]) try { execSync(`npm unlink -g "${args[0]}"`,{stdio:'inherit'}); logger.success('Unlinked'); } catch {} },

  recent: async () => {
    logger.logo('recent');
    const pk = (await pkgs()).filter(p => p.manager === 'npm');
    
    if (pk.length === 0) {
      logger.empty('No npm packages found');
      sep();
      return;
    }
    
    console.log('');
    const total = pk.length;
    let current = 0;
    
    const times: Record<string, string> = {};
    const CONCURRENCY = 10;
    const queue = [...pk];
    
    const worker = async () => {
      while (queue.length > 0) {
        const p = queue.shift();
        if (!p) break;
        
        try {
          const output = execSync(`npm view ${p.name} time.modified --json`, { encoding: 'utf8', stdio: 'pipe' }).trim();
          times[p.name] = JSON.parse(output);
        } catch (err) {}
        
        current++;
        logger.progressBar(current, total, `Fetching: ${p.name}`);
      }
    };
    
    await Promise.all(Array(CONCURRENCY).fill(null).map(worker));
    
    // Clear progress bar
    process.stdout.write('\r\x1B[2K');
    
    console.log('');
    logger.title('Recently Updated (npm)');
    
    const sorted = pk
      .map(p => ({ name: p.name, time: times[p.name] ? new Date(times[p.name]) : new Date(0) }))
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 15);

    const rows = sorted.map((p, i) => {
      const dateStr = p.time.getTime() > 0 ? p.time.toISOString().slice(0, 10) : 'Unknown';
      return [(i + 1).toString(), p.name, dateStr];
    });

    if (rows.length > 0) {
      logger.table(['No.', 'Package Name', 'Last Modified'], rows);
    } else {
      logger.empty('No data found');
    }
    sep();
  },
  
  popular: async () => {
    logger.logo('popular');
    const pk = await pkgs();
    const withCounts: any[] = [];
    
    console.log('');
    const total = pk.length;
    let current = 0;
    
    const CONCURRENCY = 10;
    const queue = [...pk];
    
    const worker = async () => {
      while (queue.length > 0) {
        const p = queue.shift();
        if (!p) break;
        
        try {
          const d = JSON.parse(execSync(`curl -s "https://api.npmjs.org/downloads/point/last-month/${p.name}"`, {encoding:'utf8', stdio: 'pipe'}));
          if (d.downloads) withCounts.push({name: p.name, downloads: d.downloads});
        } catch {}
        
        current++;
        logger.progressBar(current, total, `Fetching: ${p.name}`);
      }
    };
    
    await Promise.all(Array(CONCURRENCY).fill(null).map(worker));
    
    // Clear progress bar
    process.stdout.write('\r\x1B[2K');
    
    console.log('');
    logger.title('Most Popular (Last 30 Days)');
    
    withCounts.sort((a, b) => b.downloads - a.downloads);
    
    const rows = withCounts.slice(0, 15).map((p, i) => [
      (i + 1).toString(),
      p.name,
      p.downloads.toLocaleString()
    ]);
    
    if (rows.length > 0) {
      logger.table(['No.', 'Package Name', 'Monthly Downloads'], rows);
    } else {
      logger.empty('No download data found');
    }
    sep();
  },
  
  keywords: async (args: string[]) => commands.search(args),
  restore: async () => {
    if (!existsSync(backupFile)) { logger.error('No backup found'); return; }
    const b = JSON.parse(readFileSync(backupFile,'utf8'));
    logger.kv('Date', b.date);
    logger.kv('Packages', String(b.packages.length));
  },
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN ENTRY
// ═══════════════════════════════════════════════════════════════════════

const typos: Record<string,string> = {lsit:'list',lst:'list',chek:'check',upate:'update',instal:'install',uninstal:'uninstall',serach:'search',inf:'info',versin:'version',docor:'doctor',bakcup:'backup',exprot:'export'};

function suggest(inp: string): string | null {
  const l = inp.toLowerCase();
  if (typos[l]) return typos[l];
  const all = Object.keys(commands);
  for (const c of all) { if (c.length > 2 && Math.abs(c.length - l.length) <= 2 && c.includes(l) || (l.length > 2 && c.startsWith(l))) return c; }
  return null;
}

const args = process.argv.slice(2);
let cmd = args[0] || 'help';
const cmdArgs = args.slice(1);

// Handle aliases
if (cmd === 'ls') cmd = 'list';
if (cmd === 'i' || cmd === 'add') cmd = 'install';
if (cmd === 'rm' || cmd === 'remove') cmd = 'uninstall';
if (cmd === 'v' || cmd === 'ver') cmd = 'version';
if (cmd === 's') cmd = 'search';
if (cmd === 'up') cmd = 'update';
if (cmd === 'out') cmd = 'check';
if (cmd === 'stat') cmd = 'stats';
if (cmd === 'health') cmd = 'doctor';
if (cmd === 'security') cmd = 'audit';
if (cmd === 'clear') cmd = 'clean';
if (cmd === 'save') cmd = 'export';
if (cmd === 'fav') cmd = 'star';
if (cmd === 'favs') cmd = 'favorites';
if (cmd === 'cmp') cmd = 'compare';
if (cmd === 'homepage') cmd = 'home';
if (cmd === 'issues') cmd = 'bugs';
if (cmd === 'source') cmd = 'repo';
if (cmd === 'preview' || cmd === 'dry-run') cmd = 'dryRun';
if (cmd === 'minor') { cmd = 'update'; cmdArgs.unshift('--minor'); }
if (cmd === 'patch') { cmd = 'update'; cmdArgs.unshift('--patch'); }
if (cmd === 'av') cmd = 'available';
if (cmd === 'checkpkg') cmd = 'available';

if (!commands[cmd] && cmd !== 'help') {
  const suggestion = suggest(cmd);
  if (suggestion) {
    logger.suggest(cmd, suggestion);
    console.log('');
    logger.info('Run: pm help for all commands');
    process.exit(1);
  }
  logger.error(`Unknown command: ${cmd}`);
  logger.info('Run: pm help to see all available commands');
  logger.tip('You can also search packages with: pm search <name>');
  process.exit(1);
}

(commands[cmd] || commands.help)(cmdArgs);
