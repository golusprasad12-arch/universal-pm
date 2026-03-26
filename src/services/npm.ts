import { execSync } from 'child_process';
import type { Package, Manager } from '../types/index.ts';

export class NpmService implements Manager {
  name = 'npm' as const;
  private listCache: { packages: Package[]; timestamp: number } | null = null;
  private readonly LIST_CACHE_TTL = 30000; // 30s cache for list

  listGlobal(): Package[] {
    const now = Date.now();
    if (this.listCache && now - this.listCache.timestamp < this.LIST_CACHE_TTL) {
      return this.listCache.packages;
    }

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
      
      this.listCache = { packages, timestamp: now };
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

  private versionCache = new Map<string, { version: string; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  view(name: string, field: string): string {
    try {
      return execSync(`npm view ${name} ${field}`, { encoding: 'utf8', timeout: 5000 }).trim();
    } catch {
      return '';
    }
  }

  getLatestVersion(name: string): string {
    const cached = this.versionCache.get(name);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.version;
    }

    try {
      const version = execSync(`npm view ${name} version`, { 
        encoding: 'utf8',
        timeout: 5000,
        maxBuffer: 1024 * 1024
      }).trim();
      
      if (version) {
        this.versionCache.set(name, { version, timestamp: now });
        
        // Cleanup old cache entries
        if (this.versionCache.size > 100) {
          const expired = Array.from(this.versionCache.entries())
            .filter(([_, data]) => now - data.timestamp > this.CACHE_TTL);
          expired.forEach(([key]) => this.versionCache.delete(key));
        }
      }
      
      return version;
    } catch {
      return '';
    }
  }

  search(query: string, limit = 10): { name: string; description: string }[] {
    try {
      const output = execSync(`npm search ${query} --json`, { encoding: 'utf8', timeout: 10000 });
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
