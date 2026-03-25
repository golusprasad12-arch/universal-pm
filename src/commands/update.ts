import chalk from 'chalk';
import { execSync } from 'child_process';
import { getAllPackages, getPackageUpdates } from '../utils/packages.js';
import type { Update } from '../types.js';

export async function showCheck(type?: string) {
  const packages = getAllPackages();
  console.log(chalk.yellow(`\nChecking ${packages.length} packages for updates...\n`));

  const updates = getPackageUpdates(packages, type);

  if (updates.length === 0) {
    console.log(chalk.green('All packages are up to date!'));
    return;
  }

  console.log(chalk.cyan('=============================================='));
  console.log(chalk.red(`FOUND ${updates.length} UPDATES:`));
  console.log(chalk.cyan('==============================================\n'));

  updates.forEach((u, i) => {
    console.log(chalk.yellow(`${i + 1}. [${u.Manager}] ${u.Name}`));
    console.log(chalk.gray(`   ${u.Current} -> ${u.Latest}`));
  });

  console.log(chalk.cyan('\n=============================================='));
  console.log(chalk.yellow('SELECTIVE UPDATE'));
  console.log(chalk.cyan('=============================================='));
  console.log("Type number(s), 'a'll, 'n'one, 'q'uit\n");

  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  rl.question('Your choice: ', async (choice) => {
    rl.close();
    
    if (choice === 'q' || choice === 'Q') return;
    
    let toUpdate = updates;
    if (choice === 'n' || choice === 'N') {
      console.log(chalk.yellow('No packages updated.'));
      return;
    }
    if (choice !== 'a' && choice !== 'A') {
      const nums = choice.split(',').map(s => parseInt(s.trim()));
      toUpdate = nums.filter(n => !isNaN(n) && n > 0 && n <= updates.length)
        .map(n => updates[n - 1]).filter((u): u is Update => u !== undefined);
    }

    console.log('');
    for (const u of toUpdate) {
      console.log(chalk.yellow(`  Updating: ${u.Name}...`));
      try {
        execSync(`npm install -g ${u.Name}`, { stdio: 'ignore' });
        console.log(chalk.green(`    OK: ${u.Latest}`));
      } catch {
        console.log(chalk.red('    FAILED'));
      }
    }
    console.log(chalk.green('\nDone!'));
  });
}

export async function showDryRun() {
  const packages = getAllPackages();
  console.log(chalk.yellow('\nDRY RUN - Preview Updates\n'));

  const updates = getPackageUpdates(packages);

  if (updates.length === 0) {
    console.log(chalk.green('All packages are up to date!'));
    return;
  }

  console.log(chalk.yellow(`Would update ${updates.length} packages:\n`));
  updates.forEach(u => {
    console.log(`  [${u.Manager}] ${u.Name}: ${u.Current} -> ${u.Latest}`);
  });
  console.log(chalk.cyan('\nNo changes made (dry-run)'));
}

export async function showUpdate(name: string) {
  console.log(chalk.yellow(`\nUpdating: ${name}`));
  try {
    execSync(`npm install -g ${name}`, { stdio: 'inherit' });
    console.log(chalk.green('Updated!'));
  } catch {
    console.log(chalk.red('Failed!'));
  }
}

export async function showInstall(name: string) {
  console.log(chalk.yellow(`\nInstalling: ${name}`));
  try {
    execSync(`npm install -g ${name}`, { stdio: 'inherit' });
    console.log(chalk.green('Installed!'));
  } catch {
    console.log(chalk.red('Failed!'));
  }
}

export async function showUninstall(name: string) {
  console.log(chalk.yellow(`\nUninstalling: ${name}`));
  try {
    execSync(`npm uninstall -g ${name}`, { stdio: 'inherit' });
    console.log(chalk.green('Uninstalled!'));
  } catch {
    console.log(chalk.red('Failed!'));
  }
}

export async function showDowngrade(name: string) {
  console.log(chalk.yellow(`\nInstalling: ${name}`));
  try {
    execSync(`npm install -g ${name}`, { stdio: 'inherit' });
    console.log(chalk.green('Installed!'));
  } catch {
    console.log(chalk.red('Failed!'));
  }
}
