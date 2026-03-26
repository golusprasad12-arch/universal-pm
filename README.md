# universal-pm - Professional Package Manager CLI

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/platform-Windows-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/runtime-Bun%20%7C%20Node.js-yellow" alt="Runtime">
</p>

<p align="center">
  A unified CLI tool to manage packages across <b>npm</b>, <b>pnpm</b>, and <b>bun</b> with a beautiful colorful interface.
</p>

---

## Important Disclaimer

**This project is 100% AI-generated code.**

This CLI tool was created entirely by an AI assistant. The creator has no prior coding knowledge and built this project purely for fun and learning purposes.

If you find any bugs, issues, or have suggestions:
- Please be understanding - this was a learning project
- Feel free to report issues, but know that fixes may take time
- Contributions are welcome!

---

## Features

- **Unified Management** - Control npm, pnpm, and bun from one CLI
- **Beautiful UI** - Colorful, organized output with tables and badges
- **50+ Commands** - Search, install, update, compare packages, and more
- **GitHub Integration** - Search repos directly from CLI
- **Package Availability Check** - Check if a package exists in npm/pnpm/bun
- **Security Audit** - Run npm audit for vulnerabilities
- **Favorites System** - Save your favorite packages
- **Multiple Themes** - Support for dark, light, and red themes

---

## Installation

### Quick Start

```bash
# Clone the repo
git clone https://github.com/golusprasad12-arch/universal-pm.git
cd universal-pm

# Install dependencies
bun install

# Run directly
bun run src/index.ts

# Or build executable
bun run build
```

### Using the Executable

After building, use:
```bash
./universal-pm.exe --help    # Windows
universal-pm --help # After npm install
```

---

## Usage

### Basic Commands

```bash
universal-pm list              # List all installed packages
universal-pm check             # Check for updates
universal-pm install <pkg>     # Install a package
universal-pm uninstall <pkg>   # Remove a package
universal-pm update            # Update all packages
```

### Search & Info

```bash
universal-pm search <query>           # Search npm registry
universal-pm info <pkg>              # Get package details
universal-pm github <query>          # Search GitHub repos
universal-pm available <pkg>         # Check if package exists in npm/pnpm/bun
universal-pm compare <pkg1> <pkg2>   # Compare two packages
```

### Package Management

```bash
universal-pm outdated            # Show outdated packages
universal-pm major              # Update major versions only
universal-pm downgrade <pkg>@v   # Install specific version
universal-pm clean              # Clean cache
universal-pm audit              # Security audit
```

### Utilities

```bash
universal-pm stats              # Package statistics
universal-pm which <pkg>       # Find package location
universal-pm size              # Disk usage
universal-pm backup            # Backup package list
universal-pm doctor            # System health check
universal-pm help              # Show all commands
```

---

## Example Output

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║        ██╗   ██╗ ███╗   ██╗ ██╗         ██████╗  ███╗   ███╗         ║
║        ██║   ██║ ████╗  ██║ ██║         ██╔══██╗ ████╗ ████║         ║
║        ██║   ██║ ██╔██╗ ██║ ██║ ██████╗ ██████╔╝ ██╔████╔██║         ║
║        ██║   ██║ ██║╚██╗██║ ██║ ╚═════╝ ██╔═══╝  ██║╚██╔╝██║         ║
║        ╚██████╔╝ ██║ ╚████║ ██║         ██║      ██║ ╚═╝ ██║         ║
║         ╚═════╝  ╚═╝  ╚═══╝ ╚═╝         ╚═╝      ╚═╝     ╚═╝  v0.0.1 ║
║                                                                      ║
║                           universal-pm                               ║
║                                                                      ║
║                Professional Package Manager CLI                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

  Total Packages:  18
  npm:   16
  pnpm:  0
  bun:   2

  ┌──────────────────────┬───────────────┐
  │ Package Name         │ Version       │
  ├──────────────────────┼───────────────┤
  │ @google/gemini-cli   │ 0.35.0        │
  │ @googleworkspace/cli │ 0.19.0        │
  │ typescript           │ 5.4.2         │
  └──────────────────────┴───────────────┘
```

---

## Available Commands

| Category | Commands |
|----------|----------|
| **List & View** | list, find, outdated, tree, stats, duplicates, group, sort |
| **Update & Manage** | check, install, uninstall, update, major, dry-run, downgrade |
| **Search & Info** | search, info, github, available, compare, deps, downloads, license, reverse, recent, popular |
| **Open Links** | home, bugs, repo, changelog, web |
| **Package Info** | which, size, age, version |
| **System & Tools** | doctor, audit, clean, backup, export, json |
| **Favorites** | star, favorites, alias, run |
| **Advanced** | link, unlink, prune, cron, init, config, restore |

---

## Configuration

Themes are available:
```bash
universal-pm --dark     # Dark theme (default)
universal-pm --light    # Light theme
universal-pm --red      # Red theme
```

---

## Contributing

Since this is an AI-generated project for learning purposes:

1. Feel free to fork the project
2. Submit pull requests if you improve it
3. Don't expect fast bug fixes - the creator is learning!
4. Be kind and constructive with feedback

---

## License

MIT License - Feel free to use, modify, and distribute!

---

## Acknowledgments

- Built with [Bun](https://bun.sh) - Fast JavaScript runtime
- Colorful CLI using [Chalk](https://github.com/chalk/chalk)
- Table formatting with [cli-table](https://github.com/cli-table/cli-table)
- Command parsing with [Commander](https://github.com/tj/commander.js)

---

## Requirements

- [Bun](https://bun.sh) (recommended) or Node.js
- Windows, macOS, or Linux
- npm, pnpm, and/or bun installed

---

<p align="center">
  Made with love (and a lot of AI help!)
</p>
