import chalk from 'chalk';

chalk.level = 3;

const args = process.argv.slice(2);
const themeArg = args.find(a => a === '--dark' || a === '--red' || a === '--light');
const preferredTheme = themeArg?.replace('--', '') || 'dark';

const themes = {
dark: {
  brand: chalk.hex('#ff6b6b'),
  dim: chalk.gray,
  success: chalk.green,
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.cyan,
  white: chalk.white,
  bold: chalk.bold,
  accent: chalk.magenta,
  muted: chalk.gray,

  // Text types - VERY COLORFUL!
  primary: chalk.white,
  secondary: chalk.gray,
  label: chalk.cyan,
  value: chalk.white,
  code: chalk.green,
  path: chalk.cyan,
  number: chalk.yellow,
  version: chalk.green,
  manager: chalk.red,
  package: chalk.blue,
  description: chalk.gray,
  action: chalk.magenta,
  hint: chalk.gray,
  highlight: chalk.yellow,
  symbol: chalk.magenta,

  // New colors for detailed info - VERY COLORFUL!
  command: chalk.cyan,
  url: chalk.cyan,
  stars: chalk.yellow,
  language: chalk.magenta,
  license: chalk.magenta,
  deprecated: chalk.red.bold,
  date: chalk.cyan,
  count: chalk.yellow,

  // Table colors
  tableBorder: chalk.gray,
  tableHeader: chalk.cyan,

  // Gradient text
  gradient: {
    primary: chalk.rgb(255, 107, 107),
    secondary: chalk.rgb(78, 205, 196),
    tertiary: chalk.rgb(69, 183, 209),
  },
  badge: chalk.bgGray.black,
  badgeSuccess: chalk.bgGreen.black,
  badgeError: chalk.bgRed.white,
  badgeWarning: chalk.bgYellow.black,
  badgeInfo: chalk.bgCyan.black,
},
red: {
brand: chalk.red.bold,
dim: chalk.red.dim,
success: chalk.green,
error: chalk.red.bold,
warn: chalk.yellow,
info: chalk.red,
white: chalk.white.bold,
bold: chalk.bold,
accent: chalk.red,
muted: chalk.red.dim,

primary: chalk.white.bold,
secondary: chalk.red.dim,
label: chalk.red.dim,
value: chalk.white,
code: chalk.green,
path: chalk.cyan,
number: chalk.yellow,
version: chalk.green.bold,
manager: chalk.red.bold,
package: chalk.white.bold,
description: chalk.red.dim,
action: chalk.yellow,
hint: chalk.red.dim,
highlight: chalk.red,
symbol: chalk.red.bold,

gradient: {
primary: chalk.red.bold,
secondary: chalk.green,
tertiary: chalk.cyan,
},
badge: chalk.bgRed.black,
badgeSuccess: chalk.bgGreen.black,
badgeError: chalk.bgRed.white,
badgeWarning: chalk.bgYellow.black,
badgeInfo: chalk.bgBlue.white,
},
light: {
brand: chalk.hex('#1d3557'),
dim: chalk.gray,
success: chalk.hex('#4ecdc4'),
error: chalk.hex('#ff6b6b'),
warn: chalk.hex('#ffd93d'),
info: chalk.hex('#45b7d1'),
white: chalk.white,
bold: chalk.bold,
accent: chalk.hex('#ff9f43'),
muted: chalk.gray,

primary: chalk.white,
secondary: chalk.gray,
label: chalk.hex('#a8dadc'),
value: chalk.white,
code: chalk.hex('#a8dadc'),
path: chalk.hex('#45b7d1'),
number: chalk.hex('#ff9f43'),
version: chalk.hex('#4ecdc4'),
manager: chalk.hex('#1d3557').bold,
package: chalk.white,
description: chalk.gray,
action: chalk.hex('#1d3557'),
hint: chalk.gray,
highlight: chalk.hex('#ff9f43'),
symbol: chalk.hex('#1d3557'),

gradient: {
primary: chalk.hex('#1d3557'),
secondary: chalk.hex('#4ecdc4'),
tertiary: chalk.hex('#45b7d1'),
},
badge: chalk.bgHex('#f0f0f0').hex('#1d3557'),
badgeSuccess: chalk.bgHex('#4ecdc4').hex('#000000'),
badgeError: chalk.bgHex('#ff6b6b').hex('#ffffff'),
badgeWarning: chalk.bgHex('#ffd93d').hex('#000000'),
badgeInfo: chalk.bgHex('#45b7d1').hex('#ffffff'),
},
};

const t = themes[preferredTheme as keyof typeof themes] || themes.dark;

export { t as theme };

export const white = t.white;
export const dim = t.dim;

// Helper to get text type color
const text = {
  primary: (s: string) => t.primary(s),
  secondary: (s: string) => t.secondary(s),
  label: (s: string) => t.label(s),
  value: (s: string) => t.value(s),
  code: (s: string) => t.code(s),
  path: (s: string) => t.path(s),
  number: (s: string) => t.number(s),
  version: (s: string) => t.version(s),
  manager: (s: string) => t.manager(s),
  pkg: (s: string) => t.package(s),
  desc: (s: string) => t.description(s),
  action: (s: string) => t.action(s),
  hint: (s: string) => t.hint(s),
  highlight: (s: string) => t.highlight(s),
  symbol: (s: string) => t.symbol(s),
};

export { text };

const logoConfig: Record<string, { title: string; subtitle: string; color: (s: string) => string }> = {
  list: { title: 'LIST', subtitle: 'Installed Packages', color: chalk.hex('#3498db') },
  check: { title: 'CHECK', subtitle: 'Check for Updates', color: chalk.hex('#f39c12') },
  install: { title: 'INSTALL', subtitle: 'Install New Package', color: chalk.hex('#2ecc71') },
  uninstall: { title: 'UNINSTALL', subtitle: 'Remove Package', color: chalk.hex('#e74c3c') },
  search: { title: 'SEARCH', subtitle: 'Search npm Registry', color: chalk.hex('#9b59b6') },
  info: { title: 'INFO', subtitle: 'Package Information', color: chalk.hex('#1abc9c') },
  stats: { title: 'STATS', subtitle: 'Package Statistics', color: chalk.hex('#e67e22') },
  version: { title: 'VERSION', subtitle: 'Version Information', color: chalk.hex('#95a5a6') },
  doctor: { title: 'DOCTOR', subtitle: 'System Health Check', color: chalk.hex('#16a085') },
  backup: { title: 'BACKUP', subtitle: 'Backup Package List', color: chalk.hex('#27ae60') },
  export: { title: 'EXPORT', subtitle: 'Export Package Data', color: chalk.hex('#2980b9') },
  config: { title: 'CONFIG', subtitle: 'Configuration Settings', color: chalk.hex('#8e44ad') },
  favorites: { title: 'FAVORITES', subtitle: 'Your Favorite Packages', color: chalk.hex('#e91e63') },
  alias: { title: 'ALIAS', subtitle: 'Manage Aliases', color: chalk.hex('#00bcd4') },
  compare: { title: 'COMPARE', subtitle: 'Compare Packages', color: chalk.hex('#673ab7') },
  duplicates: { title: 'DUPLICATES', subtitle: 'Find Duplicate Packages', color: chalk.hex('#ff5722') },
  dryRun: { title: 'DRY RUN', subtitle: 'Preview Updates', color: chalk.hex('#795548') },
  major: { title: 'MAJOR', subtitle: 'Major Version Updates', color: chalk.hex('#607d8b') },
  cron: { title: 'CRON', subtitle: 'Scheduled Tasks', color: chalk.hex('#4caf50') },
  group: { title: 'GROUP', subtitle: 'Filter by Manager', color: chalk.hex('#03a9f4') },
  find: { title: 'FIND', subtitle: 'Search Installed', color: chalk.hex('#ffc107') },
  size: { title: 'SIZE', subtitle: 'Package Disk Usage', color: chalk.hex('#9c27b0') },
  age: { title: 'AGE', subtitle: 'Install Dates', color: chalk.hex('#3f51b5') },
  which: { title: 'WHICH', subtitle: 'Package Location', color: chalk.hex('#009688') },
  sort: { title: 'SORT', subtitle: 'Sort Packages', color: chalk.hex('#8bc34a') },
  recent: { title: 'RECENT', subtitle: 'Recently Updated', color: chalk.hex('#cddc39') },
  popular: { title: 'POPULAR', subtitle: 'Most Downloaded', color: chalk.hex('#ff9800') },
  reverse: { title: 'REVERSE', subtitle: 'Reverse Dependencies', color: chalk.hex('#795548') },
  changelog: { title: 'CHANGELOG', subtitle: 'Package Changelog', color: chalk.hex('#607d8b') },
  github: { title: 'GITHUB', subtitle: 'GitHub Repositories', color: chalk.hex('#4caf50') },
  available: { title: 'AVAILABLE', subtitle: 'Check Package Availability', color: chalk.hex('#00bcd4') },
  downgrade: { title: 'DOWNGRADE', subtitle: 'Downgrade Version', color: chalk.hex('#f44336') },
  logs: { title: 'LOGS', subtitle: 'Install Logs', color: chalk.hex('#2196f3') },
  audit: { title: 'AUDIT', subtitle: 'Security Audit', color: chalk.hex('#f44336') },
  clean: { title: 'CLEAN', subtitle: 'Clear Cache', color: chalk.hex('#00bcd4') },
  web: { title: 'WEB', subtitle: 'Open npm Website', color: chalk.hex('#e91e63') },
  outdated: { title: 'OUTDATED', subtitle: 'Show Outdated Packages', color: chalk.hex('#ff9800') },
  json: { title: 'JSON', subtitle: 'Output as JSON', color: chalk.hex('#607d8b') },
  prune: { title: 'PRUNE', subtitle: 'Remove Unused Packages', color: chalk.hex('#795548') },
  link: { title: 'LINK', subtitle: 'Link Local Package', color: chalk.hex('#4caf50') },
  unlink: { title: 'UNLINK', subtitle: 'Remove Global Link', color: chalk.hex('#f44336') },
  restore: { title: 'RESTORE', subtitle: 'Show Backup Info', color: chalk.hex('#2196f3') },
  run: { title: 'RUN', subtitle: 'Execute Command', color: chalk.hex('#9c27b0') },
  init: { title: 'INIT', subtitle: 'Create Configuration', color: chalk.hex('#4caf50') },
  help: { title: 'HELP', subtitle: 'Command Help', color: chalk.hex('#2196f3') },
};

const getLogo = (cmd: string): string => {
  const config = logoConfig[cmd];
  if (!config) return '';
  
  const { title, subtitle, color } = config;
  const width = Math.max(title.length + 4, subtitle.length + 4, 35);
  const leftPad = Math.floor((width - title.length) / 2);
  const rightPad = width - title.length - leftPad;
  const subLeftPad = Math.floor((width - subtitle.length) / 2);
  const subRightPad = width - subtitle.length - subLeftPad;
  
  const top = color('╔' + '═'.repeat(width) + '╗');
  const titleLine = color('║') + ' '.repeat(leftPad) + color(title) + ' '.repeat(rightPad) + color('║');
  const subtitleLine = color('║') + ' '.repeat(subLeftPad) + t.dim(subtitle) + ' '.repeat(subRightPad) + color('║');
  const bottom = color('╚' + '═'.repeat(width) + '╝');
  
  return `\n ${top}\n ${titleLine}\n ${subtitleLine}\n ${bottom}`;
};

const formatTime = () => {
const now = new Date();
return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const boxStyle = {
border: '─',
corner: '╭',
cornerBottom: '╰',
cornerRight: '╮',
cornerBottomRight: '╯',
vertical: '│',
horizontal: '─',
};

export const logger = {
  banner: () => {
    const CYAN = chalk.cyan;
    const GRAY = chalk.gray;
    const WHITE = chalk.white;

    const title = "universal-pm";
    const subtitle = "Professional Package Manager CLI";
    const version = "v0.0.1";
    const width = 70;
    const centerTitle = " ".repeat(Math.floor((width - title.length) / 2)) + title;
    const centerSubtitle = " ".repeat(Math.floor((width - subtitle.length) / 2)) + subtitle;

    console.log("");
    console.log(`  ${GRAY("╔" + "═".repeat(width) + "╗")}`);
    console.log(`  ${GRAY("║" + " ".repeat(width) + "║")}`);
    console.log(`  ${GRAY("║")}${CYAN("        ██╗   ██╗ ███╗   ██╗ ██╗         ██████╗  ███╗   ███╗         ")}${GRAY("║")}`);
    console.log(`  ${GRAY("║")}${CYAN("        ██║   ██║ ████╗  ██║ ██║         ██╔══██╗ ████╗ ████║         ")}${GRAY("║")}`);
    console.log(`  ${GRAY("║")}${CYAN("        ██║   ██║ ██╔██╗ ██║ ██║ ██████╗ ██████╔╝ ██╔████╔██║         ")}${GRAY("║")}`);
    console.log(`  ${GRAY("║")}${CYAN("        ██║   ██║ ██║╚██╗██║ ██║ ╚═════╝ ██╔═══╝  ██║╚██╔╝██║         ")}${GRAY("║")}`);
    console.log(`  ${GRAY("║")}${CYAN("        ╚██████╔╝ ██║ ╚████║ ██║         ██║      ██║ ╚═╝ ██║         ")}${GRAY("║")}`);
    console.log(`  ${GRAY("║")}${CYAN("         ╚═════╝  ╚═╝  ╚═══╝ ╚═╝         ╚═╝      ╚═╝     ╚═╝  " + version + " ")}${GRAY("║")}`);
    console.log(`  ${GRAY("║" + " ".repeat(width) + "║")}`);
    console.log(`  ${GRAY("║")}${WHITE(centerTitle)}${" ".repeat(width - centerTitle.length)}${GRAY("║")}`);
    console.log(`  ${GRAY("║" + " ".repeat(width) + "║")}`);
    console.log(`  ${GRAY("║")}${WHITE(centerSubtitle)}${" ".repeat(width - centerSubtitle.length)}${GRAY("║")}`);
    console.log(`  ${GRAY("║" + " ".repeat(width) + "║")}`);
    console.log(`  ${GRAY("╚" + "═".repeat(width) + "╝")}`);
    console.log("");
  },

  logo: (cmd: string) => {
    const l = getLogo(cmd);
    if (l) console.log(l);
  },

  success: (msg: string) => console.log(`  ${t.success('[OK]')} ${t.white(msg)}`),
  error: (msg: string) => console.log(`  ${t.error('[ERR]')} ${t.white(msg)}`),
  warn: (msg: string) => console.log(`  ${t.warn('[WRN]')} ${t.white(msg)}`),
  info: (msg: string) => console.log(`  ${t.info('[INF]')} ${t.dim(msg)}`),

  header: (title: string) => {
    console.log('');
    console.log(`  ${t.bold(t.white(title))}`);
    console.log(`  ${t.dim('─'.repeat(title.length))}`);
  },

  subheader: (title: string) => console.log(`\n  ${t.bold(t.white(title))}`),

  kv: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(18)} ${t.value(value)}`);
  },

  kvLong: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(25)} ${t.value(value)}`);
  },

  // Colorized key-value pairs
  kvPkg: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(18)} ${t.package(value)}`);
  },
  kvVersion: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(18)} ${t.version(value)}`);
  },
  kvManager: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(18)} ${t.manager(value)}`);
  },
  kvNumber: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(18)} ${t.number(value)}`);
  },
  kvPath: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(18)} ${t.path(value)}`);
  },
  kvCode: (key: string, value: string) => {
    console.log(`  ${t.label(key + ':').padEnd(18)} ${t.code(value)}`);
  },

  // Enhanced key-value with icons
  kvIcon: (icon: string, key: string, value: string, color?: (s: string) => string) => {
    const val = color ? color(value) : value;
    console.log(` ${t.dim('│')} ${t.white(icon)} ${t.label(key + ':').padEnd(16)} ${val}`);
  },

  // Colored text output
  pkg: (s: string) => t.package(s),
  ver: (s: string) => t.version(s),
  mgr: (s: string) => t.manager(s),
  num: (s: string) => t.number(s),
  path: (s: string) => t.path(s),
  code: (s: string) => t.code(s),
  desc: (s: string) => t.description(s),
  label: (s: string) => t.label(s),
  action: (s: string) => t.action(s),
  highlight: (s: string) => t.highlight(s),
  
  // New color types
  cmdColor: (s: string) => (t as any).command?.(s) || t.code(s),
  cmd_: (s: string) => (t as any).command?.(s) || t.code(s),
  url: (s: string) => (t as any).url?.(s) || t.path(s),
  stars: (s: string) => (t as any).stars?.(s) || t.number(s),
  lang: (s: string) => (t as any).language?.(s) || t.action(s),
  lic: (s: string) => (t as any).license?.(s) || t.label(s),
  dep: (s: string) => (t as any).deprecated?.(s) || t.error(s),
  deprecated: (s: string) => (t as any).deprecated?.(s) || t.error(s),
  dt: (s: string) => (t as any).date?.(s) || t.info(s),
  cnt: (s: string) => (t as any).count?.(s) || t.number(s),

  table: (headers: string[], rows: string[][]) => {
    if (rows.length === 0) return;

    const stripAnsi = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-z]/g, '');

    const widths = headers.map((h, i) => {
      const maxContentWidth = Math.max(0, ...rows.map(r => stripAnsi(r[i] || '').length));
      return Math.max(h.length, maxContentWidth) + 2;
    });

    const borderColor = t.tableBorder || t.dim;
    const headerColorFn = (s: string) => chalk.bold.cyan(s);

    const pkgColors = [
      chalk.red, chalk.green, chalk.yellow, chalk.blue, chalk.magenta, chalk.cyan,
      chalk.redBright, chalk.greenBright, chalk.yellowBright, chalk.blueBright, chalk.magentaBright, chalk.cyanBright,
      chalk.hex('#FF6B6B'), chalk.hex('#4ECDC4'), chalk.hex('#45B7D1'), chalk.hex('#96CEB4'), chalk.hex('#FFEAA7'), chalk.hex('#DDA0DD'),
    ];

    const getPkgColor = (index: number) => pkgColors[index % pkgColors.length];
    const borderColors = [chalk.red, chalk.green, chalk.yellow, chalk.blue, chalk.magenta, chalk.cyan];
    const getBorderColor = (index: number) => borderColors[index % borderColors.length];

    const createLine = (left: string, mid: string, right: string, char: string, rowIndex: number = -1) => {
      const bc = rowIndex >= 0 ? getBorderColor(rowIndex) : borderColor;
      return '  ' + bc(left + widths.map(w => char.repeat(w)).join(mid) + right);
    };

    console.log(createLine('┌', '┬', '┐', '─', 0));

    const headerLine = '  ' + borderColor('│') + headers.map((h, i) => {
      const w = widths[i];
      return headerColorFn(' ' + h.padEnd(w - 1));
    }).join(borderColor('│')) + borderColor('│');
    
    console.log(headerLine);
    console.log(createLine('├', '┼', '┤', '─', 1));
    
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      const pkgColor = getPkgColor(rowIdx);
      const rowBorder = getBorderColor(rowIdx + 2);
      
      const rowLine = '  ' + rowBorder('│') + row.map((cell, i) => {
        const w = widths[i];
        const val = (cell || '');
        const plainVal = stripAnsi(val);
        const padding = ' '.repeat(w - plainVal.length - 1);
        
        let formatted = val;
        
        if (i === 0) {
          // First column - check if it's a manager or package name
          if (val === 'npm' || val === 'pnpm' || val === 'bun') {
            // Manager names - use specific colors
            if (val === 'npm') formatted = chalk.red(val);
            else if (val === 'pnpm') formatted = chalk.yellow(val);
            else if (val === 'bun') formatted = chalk.magenta(val);
          } else {
            // Package names - cycle through colors
            formatted = pkgColor(val);
          }
        } else if (val.startsWith('[') && val.endsWith(']')) {
          // Manager tags - specific colors
          if (val.includes('npm')) formatted = chalk.red(val);
          else if (val.includes('pnpm')) formatted = chalk.yellow(val);
          else if (val.includes('bun')) formatted = chalk.magenta(val);
          else formatted = (t.manager || t.accent)(val);
        }
        else if (/^\d+\.\d+/.test(val) || /^\d+/.test(val)) {
          // Version numbers - use same color as package name (first column)
          formatted = pkgColor(val);
        }
        else if (val.includes('✓') || val.includes('✔')) formatted = chalk.green(val);
        else if (val.includes('✗') || val.includes('✖')) formatted = chalk.red(val);
        else formatted = t.dim(val);
        
        return ' ' + formatted + padding;
      }).join(rowBorder('│')) + rowBorder('│');
      console.log(rowLine);
    }

    console.log(createLine('└', '┴', '┘', '─', 3));
  },

  // Package list with colored output
  pkgList: (items: Array<{name: string, version: string, manager: string}>) => {
    for (const item of items) {
      console.log(`  ${t.bold(t.package(item.name.padEnd(24)))}${t.dim('│')}${t.version(item.version.padEnd(12))}${t.dim('│')}${t.manager('[' + item.manager + ']')}`);
    }
  },

  // Update list with colored versions
  updateList: (items: Array<{name: string, version: string, latest: string, manager: string}>) => {
    for (const item of items) {
      const hasUpdate = item.version !== item.latest;
      console.log(`  ${t.bold(t.package(item.name.padEnd(20)))}${t.dim('│')}${t.version(item.version.padEnd(12))}${t.dim('→')}${t.highlight(item.latest.padEnd(16))}${t.dim('│')}${t.manager('[' + item.manager + ']')}`);
    }
  },

    errorHelp: (msg: string, tip?: string) => {
    console.log(`\n  ${t.error('[ERR]')} ${t.white(msg)}`);
    if (tip) console.log(`  ${t.info('[INF]')} ${t.dim(tip)}`);
  },

  suggest: (wrong: string, right: string) => {
    console.log(`\n  ${t.warn('[WRN]')} Unknown: ${wrong}`);
    console.log(`  ${t.info('[INF]')} Did you mean: ${t.bold(t.white('pm ' + right + '?'))}`);
  },

  tip: (tip: string) => console.log(`\n  ${t.info('•')} ${t.dim(tip)}`),

    next: (steps: string[]) => {
    console.log('');
    console.log(`  ${t.bold(t.white('Next steps:'))}`);
    steps.forEach((s, i) => console.log(`  ${t.dim(`${i+1}.`)} ${t.white(s)}`));
  },

  helpHeader: (title: string) => {
    console.log(`\n  ${t.bold(t.accent(title))}`);
    console.log(`  ${t.dim('─'.repeat(40))}`);
  },

  helpEntry: (cmd: string, desc: string, tag?: string, tagType: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const cmdStr = chalk.cyan(t.bold(cmd.padEnd(22)));
    const descStr = chalk.gray(desc);
    const tagStr = tag ? ` ${logger.badge(tag, tagType)}` : '';
    console.log(`    ${cmdStr} ${descStr}${tagStr}`);
  },

  usage: (cmd: string, desc: string) => {
    console.log(`  ${t.bold(t.white(cmd.padEnd(28)))} ${t.dim(desc)}`);
  },

  cmd: (cmd: string) => console.log(`  ${t.bold(t.white(cmd))}`),

  example: (cmd: string, desc: string) => {
    console.log(`  ${t.bold(t.white(cmd.padEnd(26)))} ${t.dim(desc)}`);
  },

  coming: (feature: string) => {
    console.log(`\n  ${t.warn('!')} ${t.white(feature + ' is not yet implemented')}`);
    console.log(`  ${t.dim('This feature is planned for a future release')}\n`);
  },

    empty: (message: string, suggestion?: string) => {
    console.log(`\n  ${t.info('•')} ${t.white(message)}`);
    if (suggestion) console.log(`  ${t.dim(suggestion)}\n`);
  },

  loading: (message: string) => {
    console.log(`  ${t.dim('...')} ${t.white(message)}`);
  },

   spinner: (message: string, active = true) => {
     if (!active) return () => {};
     const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
     let frame = 0;
     const interval = setInterval(() => {
       process.stdout.write(`\r${t.dim('  ' + frames[frame % frames.length] + ' ')} ${t.white(message)}`);
       frame++;
     }, 80);
     return () => {
       clearInterval(interval);
       process.stdout.write('\r\x1B[2K');
     };
   },

   // New helper for clear sections
   startSection: (title: string, cmd: string) => {
     logger.logo(cmd);
     console.log('');
     logger.header(title);
   },

   // Styled version of info for headers
   title: (msg: string) => console.log(`\n  ${t.bold(t.accent('» ' + msg))}\n`),

   progressBar: (current: number, total: number, message: string) => {
     const percent = Math.round((current / total) * 100);
     const barLength = 25;
     const filled = Math.round((barLength * current) / total);
     const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
     process.stdout.write(`\r  ${t.dim('[')}${t.success(bar)}${t.dim(']')} ${t.white(percent.toString().padStart(3) + '%')} ${t.dim(message.padEnd(35))}`);
   },

   commandHelp: (command: string, description: string, usage: string, examples: string[], aliases: string[]) => {
     console.log('');
     console.log(`  ${t.bold(t.white(command))}`);
     console.log(`  ${t.dim(description)}`);
     console.log('');
     console.log(`  ${t.bold(t.white('Usage'))}`);
     console.log(`  ${t.dim(`pm ${usage}`)}`);
     
     if (aliases.length > 0) {
       console.log('');
       console.log(`  ${t.bold(t.white('Aliases'))}`);
       console.log(`  ${aliases.map(a => t.dim(`pm ${a}`)).join(', ')}`);
     }
     
     if (examples.length > 0) {
       console.log('');
       console.log(`  ${t.bold(t.white('Examples'))}`);
       examples.forEach(example => {
         console.log(`  ${t.dim(example)}`);
       });
     }
   },

  separator: () => console.log(''),

  // Clean UI elements
  divider: () => console.log(`  ${t.dim('─'.repeat(40))}`),

  section: (title: string, content: () => void) => {
    console.log('');
    console.log(`  ${t.bold(t.white(title))}`);
    console.log(`  ${t.dim('─'.repeat(title.length))}`);
    content();
  },

  card: (title: string, lines: string[]) => {
    console.log(`\n  ${t.bold(t.white(title))}`);
    lines.forEach(line => {
      console.log(`  ${t.dim(line)}`);
    });
  },

  badge: (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const badges = {
      success: chalk.bgGreen.black,
      error: chalk.bgRed.white,
      warning: chalk.bgYellow.black,
      info: chalk.bgCyan.black,
    };
    return badges[type](' ' + text + ' ');
  },

  // Enhanced box/border rendering
  box: (title: string, content: string[], type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const colors = {
      info: t.info,
      success: t.success,
      warning: t.warn,
      error: t.error,
    };
    const color = colors[type];
    const maxLength = Math.max(title.length, ...content.map(c => c.length));
    const width = maxLength + 4;

    console.log('');
    console.log(`  ${color('┌' + '─'.repeat(width) + '┐')}`);
    console.log(`  ${color('│')} ${t.bold(t.white(title.padEnd(width - 2)))} ${color('│')}`);
    console.log(`  ${color('├' + '─'.repeat(width) + '┤')}`);
    content.forEach(line => {
      console.log(`  ${color('│')} ${t.dim(line.padEnd(width - 2))} ${color('│')}`);
    });
    console.log(`  ${color('└' + '─'.repeat(width) + '└')}`);
  },

  // Compact list item with icon
  listItem: (icon: string, text: string, color: (s: string) => string = t.white) => {
    console.log(`  ${t.dim('│')} ${icon} ${color(text)}`);
  },

  // Status indicator
  status: (status: 'pending' | 'running' | 'success' | 'error', message: string) => {
    const icons = {
      pending: '[...]',
      running: '[RUN]',
      success: '[OK]',
      error: '[ERR]',
    };
    const colors = {
      pending: t.dim,
      running: t.info,
      success: t.success,
      error: t.error,
    };
    console.log(`  ${colors[status](icons[status])} ${t.white(message)}`);
  },

  // Command suggestion box
  suggestBox: (title: string, commands: Array<{cmd: string, desc: string}>) => {
    console.log('');
    console.log(`  ${t.bold(t.white(title))}`);
    console.log(`  ${t.dim('─'.repeat(title.length))}`);
    commands.forEach(({cmd, desc}) => {
      console.log(`  ${t.code(cmd.padEnd(30))} ${t.dim(desc)}`);
    });
  },

  // Summary card
  summary: (items: Array<{label: string, value: string, color?: (s: string) => string}>) => {
    const maxLabel = Math.max(...items.map(i => i.label.length));
    console.log('');
    items.forEach(({label, value, color = t.white}) => {
      console.log(`  ${t.label(label + ':').padEnd(maxLabel + 2)} ${color(value)}`);
    });
  },

  // Highlighted command
  cmdHighlight: (cmd: string) => {
    console.log(`  ${t.dim('$')} ${t.code(cmd)}`);
  },

  // Multi-line info block
  infoBlock: (title: string, lines: string[]) => {
    console.log('');
    console.log(`  ${t.info('●')} ${t.bold(t.white(title))}`);
    lines.forEach(line => {
      console.log(`  ${t.dim('  ' + line)}`);
    });
  },

  // Warning block
  warnBlock: (message: string) => {
    console.log('');
    console.log(`  ${t.warn('⚠')} ${t.bold(t.white('Warning'))}`);
    console.log(`  ${t.dim('  ' + message)}`);
  },

  // Error block with details
  errorBlock: (message: string, details?: string[]) => {
    console.log('');
    console.log(`  ${t.error('✗')} ${t.bold(t.white(' Error '))} ${t.dim(message)}`);
    if (details && details.length > 0) {
      console.log('');
      details.forEach(detail => {
        console.log(`    ${t.dim('• ' + detail)}`);
      });
    }
  },

  // Success block
  successBlock: (message: string, details?: string[]) => {
    console.log('');
    console.log(`  ${t.success('✓')} ${t.bold(t.white(message))}`);
    if (details && details.length > 0) {
      details.forEach(detail => {
        console.log(`    ${t.dim('• ' + detail)}`);
      });
    }
  },
  
  // Warn block
  warnBlock: (message: string, details?: string[]) => {
    console.log('');
    console.log(`  ${t.warn('⚠')} ${t.bold(t.white(' Warning '))} ${t.dim(message)}`);
    if (details && details.length > 0) {
      console.log('');
      details.forEach(detail => {
        console.log(`    ${t.dim('• ' + detail)}`);
      });
    }
  },

  // Success block
  successBlock: (message: string, details?: string[]) => {
    console.log('');
    console.log(`  ${t.success('✓')} ${t.bold(t.white(message))}`);
    if (details && details.length > 0) {
      details.forEach(detail => {
        console.log(`  ${t.dim('  ' + detail)}`);
      });
    }
  },
};

export const sep = () => console.log('');
export const separator = () => console.log('');
