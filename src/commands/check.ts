import chalk from 'chalk';
import { BaseCommand } from '../core/registry.ts';
import { pm } from '../services/manager.ts';
import { logger, separator } from '../core/logger.ts';

export class CheckCommand extends BaseCommand {
  name = 'check';
  description = 'Check for package updates';
  aliases = ['update', 'upgrade', 'up'];

  async execute(args: string[]): Promise<void> {
    const packages = pm.listAll();
    
    if (packages.length === 0) {
      logger.info('No packages found');
      return;
    }
    
    logger.header(`Checking ${packages.length} packages...`);
    
    const updates = await pm.checkUpdates(packages);
    
    if (updates.length === 0) {
      logger.success('All packages are up to date!');
      return;
    }

    logger.warn(`Found ${updates.length} updates available:`);
    
    const rows = updates.map(u => [
      chalk.yellow(u.name),
      chalk.gray(u.version),
      chalk.green(u.latest),
      chalk.cyan(`[${u.manager}]`)
    ]);
    
    logger.table(['Package', 'Current', 'Latest', 'Manager'], rows);
    separator();
    
    logger.info('Run: universal-pm install <package> to update');
  }
}

export class OutdatedCommand extends BaseCommand {
  name = 'outdated';
  description = 'Show outdated packages';

  async execute(args: string[]): Promise<void> {
    await new CheckCommand().execute(args);
  }
}
