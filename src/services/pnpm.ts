import { execSync } from 'child_process';
import type { Package, Manager } from '../types/index.ts';

export class PnpmService implements Manager {
  name = 'pnpm' as const;

  listGlobal(): Package[] {
    try {
      const output = execSync('pnpm list -g --depth=0', { encoding: 'utf8', stdio: 'pipe' });
      const packages: Package[] = [];
      
      for (const line of output.split('\n').slice(2)) {
        const match = line.match(/--\s+(@[\w-]+\/[\w-]+|[\w-]+)@(\d+[\d.\-]*)/);
        if (match && match[1] && match[2]) {
          packages.push({
            manager: 'pnpm',
            name: match[1],
            version: match[2]
          });
        }
      }
      return packages;
    } catch {
      return [];
    }
  }

  install(name: string, version?: string): void {
    const pkg = version ? `${name}@${version}` : name;
    execSync(`pnpm add -g ${pkg}`, { stdio: 'inherit' });
  }

  uninstall(name: string): void {
    execSync(`pnpm remove -g ${name}`, { stdio: 'inherit' });
  }

  view(name: string, field: string): string {
    try {
      return execSync(`pnpm view ${name} ${field}`, { encoding: 'utf8', timeout: 5000 }).trim();
    } catch {
      return '';
    }
  }
}

export const pnpm = new PnpmService();
