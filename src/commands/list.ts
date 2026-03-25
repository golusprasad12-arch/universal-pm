import chalk from 'chalk';
import { BaseCommand } from '../core/registry.ts';
import { pm } from '../services/manager.ts';
import { logger, separator } from '../core/logger.ts';

export class ListCommand extends BaseCommand {
  name = 'list';
  description = 'List all installed packages';
  aliases = ['ls', 'l'];

  async execute(args: string[]): Promise<void> {
    const manager = args[0] as any;
    const packages = manager && ['npm', 'pnpm', 'bun'].includes(manager) 
      ? pm.listByManager(manager)
      : pm.listAll();

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
      
      const rows = pkgs
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(pkg => [
          chalk.green('  ') + pkg.name,
          chalk.gray(pkg.version)
        ]);
      
      if (rows.length > 0) {
        logger.table(['Package', 'Version'], rows);
      }
    }
    
    separator();
  }
}
