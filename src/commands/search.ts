import chalk from 'chalk';
import { execSync } from 'child_process';
import { npmView } from '../utils/packages.js';

export async function searchNpm(query: string) {
  console.log(chalk.yellow(`\nSearching npm: ${query}\n`));
  
  try {
    const results = execSync(`npm search ${query} --json`, { encoding: 'utf8' });
    const parsed = JSON.parse(results);
    
    parsed.slice(0, 10).forEach((r: any, i: number) => {
      console.log(chalk.green(`${i + 1}. ${r.name}`));
      console.log(chalk.gray(`   ${r.description}`));
    });
  } catch {
    console.log(chalk.red('Search failed'));
  }
  console.log('');
}

export async function searchGitHub(query: string) {
  console.log(chalk.yellow(`\nSearching GitHub: ${query}\n`));
  
  try {
    const { execSync } = await import('child_process');
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10`;
    const results = execSync(`curl -s "${url}"`, { encoding: 'utf8' });
    const parsed = JSON.parse(results);
    
    if (parsed.items) {
      parsed.items.forEach((r: any, i: number) => {
        console.log(chalk.green(`${i + 1}. ${r.full_name}`));
        console.log(chalk.gray(`   Stars: ${r.stargazers_count} | Lang: ${r.language}`));
        console.log(chalk.cyan(`   ${r.html_url}`));
      });
    }
  } catch {
    console.log(chalk.red('Search failed'));
  }
  console.log('');
}

export async function showInfo(name: string) {
  console.log(chalk.yellow(`\nPackage Info: ${name}`));
  console.log(chalk.cyan('==============================================\n'));

  const desc = npmView(name, 'description');
  const ver = npmView(name, 'version');
  const license = npmView(name, 'license');
  const homepage = npmView(name, 'homepage');
  const deprecated = npmView(name, 'deprecated');

  console.log(chalk.green('Name: ') + name);
  console.log(chalk.white('Version: ') + ver);
  console.log(chalk.white('License: ') + license);
  if (deprecated) console.log(chalk.red('Deprecated: YES - ') + deprecated);
  console.log(chalk.gray('Description: ') + desc);
  console.log(chalk.cyan('Homepage: ') + homepage);

  console.log(chalk.yellow('\n--- Install Commands ---'));
  console.log(chalk.white(`npm install -g ${name}`));
  console.log(chalk.white(`pnpm add -g ${name}`));
  console.log(chalk.white(`bun add -g ${name}`));
  console.log('');
}

export async function showDeps(name: string) {
  console.log(chalk.yellow(`\nDependencies of ${name}\n`));
  execSync(`npm view ${name} dependencies`, { stdio: 'inherit' });
  console.log('');
}

export async function showDownloads(name: string) {
  try {
    const url = `https://api.npmjs.org/downloads/point/last-month/${name}`;
    const data = execSync(`curl -s "${url}"`, { encoding: 'utf8' });
    const parsed = JSON.parse(data);
    console.log(chalk.green(`\n${name} Downloads (30 days): ${parsed.downloads}\n`));
  } catch {
    console.log(chalk.red('Package not found!'));
  }
}

export async function showLicense(name: string) {
  const license = npmView(name, 'license');
  console.log(chalk.green(`\n${name} License: ${license}\n`));
}

export async function showKeywords(word: string) {
  console.log(chalk.yellow(`\nSearching npm for keyword: ${word}\n`));
  await searchNpm(word);
}

export async function showBugs(name: string) {
  const bugs = npmView(name, 'bugs.url');
  if (bugs) {
    console.log(chalk.green(`\nBug reports: ${bugs}\n`));
  } else {
    console.log(chalk.red('No bugs URL found!\n'));
  }
}

export async function showRepo(name: string) {
  let repo = npmView(name, 'repository.url');
  repo = repo.replace('git+', '').replace('.git', '');
  if (repo) {
    console.log(chalk.green(`\nRepository: ${repo}\n`));
  } else {
    console.log(chalk.red('No repository found!\n'));
  }
}

export async function showHome(name: string) {
  const homepage = npmView(name, 'homepage');
  if (homepage) {
    console.log(chalk.yellow(`\nOpening: ${homepage}`));
    try {
      execSync(`start ${homepage}`);
    } catch {}
  } else {
    console.log(chalk.red('No homepage found!\n'));
  }
}

export async function showReverse(name: string) {
  console.log(chalk.yellow('\nReverse dependencies:\n'));
  const result = npmView(name, 'dependents');
  console.log(result || 'None found');
  console.log('');
}

export async function showChangelog(name: string) {
  console.log(chalk.yellow(`\nChangelog for ${name}\n`));
  const changelog = npmView(name, 'changelog');
  if (changelog) {
    console.log(changelog.slice(0, 2000));
  } else {
    console.log(chalk.yellow('No changelog available.'));
    console.log(chalk.white(`  npm repo ${name}`));
  }
  console.log('');
}

export async function showCompare(pkg1: string, pkg2: string) {
  console.log(chalk.yellow(`\nComparing: ${pkg1} vs ${pkg2}`));
  console.log(chalk.cyan('==============================================\n'));

  const v1 = npmView(pkg1, 'version');
  const v2 = npmView(pkg2, 'version');
  const d1 = npmView(pkg1, 'description');
  const d2 = npmView(pkg2, 'description');

  try {
    const s1 = JSON.parse(execSync(`curl -s "https://api.npmjs.org/downloads/point/last-month/${pkg1}"`, { encoding: 'utf8' })).downloads;
    const s2 = JSON.parse(execSync(`curl -s "https://api.npmjs.org/downloads/point/last-month/${pkg2}"`, { encoding: 'utf8' })).downloads;

    console.log(chalk.green(`${pkg1}:`));
    console.log(chalk.white(`  Version: ${v1}`));
    console.log(chalk.white(`  Downloads: ${s1}`));
    console.log(chalk.gray(`  ${d1}`));
    console.log('');
    console.log(chalk.green(`${pkg2}:`));
    console.log(chalk.white(`  Version: ${v2}`));
    console.log(chalk.white(`  Downloads: ${s2}`));
    console.log(chalk.gray(`  ${d2}`));
  } catch {}
  console.log('');
}

export async function showRecent() {
  console.log(chalk.yellow('\nRECENTLY UPDATED\n'));
  const { getAllPackages } = await import('../utils/packages.js');
  const packages = getAllPackages();
  
  for (const pkg of packages.slice(0, 10)) {
    const time = npmView(pkg.Name, 'time.modified');
    if (time) {
      console.log(`  ${pkg.Name}: ${time}`);
    }
  }
  console.log('');
}

export async function showPopular() {
  console.log(chalk.yellow('\nMOST DOWNLOADED (from your packages)\n'));
  const { getAllPackages } = await import('../utils/packages.js');
  const packages = getAllPackages();
  
  const withCounts: { name: string; downloads: number }[] = [];
  for (const pkg of packages) {
    try {
      const data = JSON.parse(execSync(`curl -s "https://api.npmjs.org/downloads/point/last-month/${pkg.Name}"`, { encoding: 'utf8' }));
      if (data.downloads) withCounts.push({ name: pkg.Name, downloads: data.downloads });
    } catch {}
  }

  withCounts.sort((a, b) => b.downloads - a.downloads).slice(0, 10).forEach(p => {
    console.log(chalk.green(`  ${p.name}: ${p.downloads} downloads`));
  });
  console.log('');
}

export async function checkGitHubInstall(url: string) {
  console.log(chalk.yellow(`\nChecking GitHub: ${url}`));
  console.log(chalk.cyan('==============================================\n'));

  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match || !match[1] || !match[2]) {
    console.log(chalk.red('Invalid GitHub URL!'));
    return;
  }

  const owner = match[1];
  const repo = match[2].replace('.git', '');

  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const info = JSON.parse(execSync(`curl -s "${apiUrl}"`, { encoding: 'utf8' }));

    console.log(chalk.green('Repo: ') + info.full_name);
    console.log(chalk.white('Stars: ') + info.stargazers_count);
    console.log(chalk.white('Language: ') + info.language);
    console.log(chalk.white('License: ') + info.license?.name);
    console.log('');

    console.log(chalk.yellow('--- Install Commands ---'));
    console.log(chalk.white(`npm install -g ${url}`));
    console.log(chalk.white(`bun add ${owner}/${repo}`));
    console.log(chalk.white(`pnpm add ${owner}/${repo}`));
    console.log('');

    console.log(chalk.yellow('--- Dependencies ---'));
    const pkgUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`;
    try {
      const pkgJson = JSON.parse(execSync(`curl -s "${pkgUrl}"`, { encoding: 'utf8' }));
      if (pkgJson.dependencies) {
        console.log(chalk.white('Dependencies:'));
        Object.entries(pkgJson.dependencies).slice(0, 10).forEach(([k, v]) => {
          console.log(chalk.gray(`  ${k}: ${v}`));
        });
      }
    } catch {
      console.log(chalk.gray('No package.json found'));
    }
  } catch {
    console.log(chalk.red('Failed to fetch repo info!'));
  }
  console.log('');
}
