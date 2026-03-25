import { npm } from './npm.ts';
import { pnpm } from './pnpm.ts';
import { bun } from './bun.ts';
import type { Package, Update, Manager, ManagerType } from '../types/index.ts';

export class PackageManager {
  private services: Record<ManagerType, Manager> = {
    npm,
    pnpm,
    bun
  };

  async listAll(): Promise<Package[]> {
    const results = await Promise.all([
      Promise.resolve(npm.listGlobal()),
      Promise.resolve(pnpm.listGlobal()),
      Promise.resolve(bun.listGlobal())
    ]);
    return results.flat();
  }

  listByManager(manager: ManagerType): Package[] {
    return this.services[manager].listGlobal();
  }

  install(name: string, manager: ManagerType = 'npm', version?: string): void {
    this.services[manager].install(name, version);
  }

  uninstall(name: string): void {
    const pkg = this.listAllSync().find(p => p.name === name);
    if (pkg) {
      this.services[pkg.manager].uninstall(name);
    } else {
      console.error(`Package '${name}' not found. Trying npm uninstall anyway...`);
      npm.uninstall(name);
    }
  }

  private listAllSync(): Package[] {
    return [
      ...npm.listGlobal(),
      ...pnpm.listGlobal(),
      ...bun.listGlobal()
    ];
  }

  getLatestVersion(name: string): string {
    return npm.getLatestVersion(name);
  }

  async checkUpdates(packages: Package[], onProgress?: (current: number, total: number, name: string) => void): Promise<Update[]> {
    const total = packages.length;
    let current = 0;
    
    const CONCURRENCY = 5;
    const updates: Update[] = [];
    const queue = [...packages];
    
    const worker = async () => {
      while (queue.length > 0) {
        const pkg = queue.shift();
        if (!pkg) break;
        
        try {
          const latest = npm.getLatestVersion(pkg.name);
          if (latest && latest !== pkg.version) {
            updates.push({ ...pkg, latest });
          }
        } catch {}
        
        current++;
        if (onProgress) onProgress(current, total, pkg.name);
      }
    };
    
    await Promise.all(Array(CONCURRENCY).fill(null).map(worker));
    return updates;
  }

  search(query: string): { name: string; description: string }[] {
    return npm.search(query);
  }

  getPackageInfo(name: string) {
    return npm.getPackageInfo(name);
  }

  getManager(name: ManagerType): Manager {
    return this.services[name];
  }
}

export const pm = new PackageManager();
