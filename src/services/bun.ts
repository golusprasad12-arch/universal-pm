import { execSync } from 'child_process';
import type { Package, Manager } from '../types/index.ts';

export class BunService implements Manager {
  name = 'bun' as const;

  listGlobal(): Package[] {
    try {
      const output = execSync('bun pm ls -g', { encoding: 'utf8', stdio: 'pipe' });
      const packages: Package[] = [];
      
      for (const line of output.split('\n').slice(1)) {
        const match = line.match(/[@├└]?\s*(@[\w-]+\/[\w-]+|[\w-]+)@(\d+[\d.\-]*)/);
        if (match && match[1] && match[2]) {
          packages.push({
            manager: 'bun',
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
    execSync(`bun pm add -g ${pkg}`, { stdio: 'inherit' });
  }

  uninstall(name: string): void {
    execSync(`bun pm remove -g ${name}`, { stdio: 'inherit' });
  }

  view(name: string, field: string): string {
    try {
      return execSync(`bun pm view ${name} ${field}`, { encoding: 'utf8' }).trim();
    } catch {
      return '';
    }
  }
}

export const bun = new BunService();
