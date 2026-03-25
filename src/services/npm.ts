import { execSync } from 'child_process';
import type { Package, Manager } from '../types/index.ts';

export class NpmService implements Manager {
  name = 'npm' as const;

  listGlobal(): Package[] {
    try {
      const output = execSync('npm list -g --depth=0', { encoding: 'utf8', stdio: 'pipe' });
      const packages: Package[] = [];
      
      for (const line of output.split('\n').slice(2)) {
        const match = line.match(/--\s+(@[\w-]+\/[\w-]+|[\w-]+)@([\d.]+[-a-zA-Z0-9.]*)/);
        if (match && match[1] && match[2]) {
          packages.push({
            manager: 'npm',
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
    execSync(`npm install -g ${pkg}`, { stdio: 'inherit' });
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

  getLatestVersion(name: string): string {
    return this.view(name, 'version');
  }

  search(query: string, limit = 10): { name: string; description: string }[] {
    try {
      const output = execSync(`npm search ${query} --json`, { encoding: 'utf8' });
      return JSON.parse(output).slice(0, limit).map((r: any) => ({
        name: r.name,
        description: r.description
      }));
    } catch {
      return [];
    }
  }

  getPackageInfo(name: string): Partial<Package> & Record<string, string> {
    const fields = ['description', 'version', 'license', 'homepage', 'repository', 'keywords', 'maintainers', 'deprecated'];
    const info: Record<string, string> = {};
    
    for (const field of fields) {
      const value = this.view(name, field);
      if (value) info[field] = value;
    }
    
    return info as any;
  }
}

export const npm = new NpmService();
