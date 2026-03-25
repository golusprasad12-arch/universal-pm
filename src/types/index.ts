export interface Package {
  manager: 'npm' | 'pnpm' | 'bun';
  name: string;
  version: string;
  description?: string;
}

export interface Update extends Package {
  latest: string;
}

export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  options?: CommandOption[];
  execute(args: string[], options?: Record<string, string>): Promise<void>;
}

export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: string;
}

export interface Config {
  autoUpdate: boolean;
  notify: boolean;
  defaultManager: 'npm' | 'pnpm' | 'bun';
  theme: 'dark' | 'light';
  backupPath: string;
}

export interface SearchResult {
  name: string;
  description: string;
  version: string;
  downloads: number;
}

export interface GitHubRepo {
  fullName: string;
  stars: number;
  language: string;
  license: string;
  description: string;
  url: string;
}

export type ManagerType = 'npm' | 'pnpm' | 'bun';

export interface Manager {
  name: ManagerType;
  listGlobal(): Package[];
  install(name: string, version?: string): void;
  uninstall(name: string): void;
  view(name: string, field: string): string;
}
