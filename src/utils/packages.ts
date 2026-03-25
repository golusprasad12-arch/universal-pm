import { execSync } from 'child_process';
import type { Package, Update } from '../types.js';

export function getAllPackages(): Package[] {
  const packages: Package[] = [];

  try {
    const npmOut = execSync('npm list -g --depth=0', { encoding: 'utf8' });
    const lines = npmOut.split('\n').slice(2);
    for (const line of lines) {
      const match = line.match(/--\s+(@[\w-]+\/[\w-]+|[\w-]+)@(\d+[\d.\-]*)/);
      if (match) {
        const name = match[1];
        const version = match[2];
        if (name && version) {
          packages.push({ Manager: 'npm', Name: name, Version: version });
        }
      }
    }
  } catch {}

  try {
    const pnpmOut = execSync('pnpm list -g --depth=0', { encoding: 'utf8' });
    const lines = pnpmOut.split('\n').slice(2);
    for (const line of lines) {
      const match = line.match(/--\s+(@[\w-]+\/[\w-]+|[\w-]+)@(\d+[\d.\-]*)/);
      if (match) {
        const name = match[1];
        const version = match[2];
        if (name && version) {
          packages.push({ Manager: 'pnpm', Name: name, Version: version });
        }
      }
    }
  } catch {}

  try {
    const bunOut = execSync('bun pm ls -g', { encoding: 'utf8' });
    const lines = bunOut.split('\n').slice(1);
    for (const line of lines) {
      const match = line.match(/[@├└]?\s*(@[\w-]+\/[\w-]+|[\w-]+)@(\d+[\d.\-]*)/);
      if (match) {
        const name = match[1];
        const version = match[2];
        if (name && version) {
          packages.push({ Manager: 'bun', Name: name, Version: version });
        }
      }
    }
  } catch {}

  return packages;
}

export function getPackageUpdates(packages: Package[], type?: string): Update[] {
  const updates: Update[] = [];

  for (const pkg of packages) {
    try {
      const latestRaw = execSync(`npm view ${pkg.Name} version`, { encoding: 'utf8' });
      const latest = latestRaw.trim();
      if (latest && latest !== pkg.Version) {
        if (type === 'major' || type === 'minor' || type === 'patch') {
          const currentParts = pkg.Version.replace(/[^\d].*/, '').split('.');
          const latestParts = latest.replace(/[^\d].*/, '').split('.');
          const currentMaj = parseInt(currentParts[0] || '0');
          const latestMaj = parseInt(latestParts[0] || '0');
          const currentMin = parseInt((currentParts[1] || '').replace(/[^0-9]/g, '') || '0');
          const latestMin = parseInt((latestParts[1] || '').replace(/[^0-9]/g, '') || '0');

          if (type === 'major' && latestMaj > currentMaj) {
            updates.push({ Manager: pkg.Manager, Name: pkg.Name, Current: pkg.Version, Latest: latest });
          } else if (type === 'minor' && (latestMaj > currentMaj || (latestMaj === currentMaj && latestMin > currentMin))) {
            updates.push({ Manager: pkg.Manager, Name: pkg.Name, Current: pkg.Version, Latest: latest });
          } else if (type === 'patch') {
            updates.push({ Manager: pkg.Manager, Name: pkg.Name, Current: pkg.Version, Latest: latest });
          }
        } else {
          updates.push({ Manager: pkg.Manager, Name: pkg.Name, Current: pkg.Version, Latest: latest });
        }
      }
    } catch {}
  }

  return updates;
}

export function npmView(name: string, field: string): string {
  try {
    return execSync(`npm view ${name} ${field}`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}
