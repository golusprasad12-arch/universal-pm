export interface Package {
  Manager: 'npm' | 'pnpm' | 'bun';
  Name: string;
  Version: string;
}

export interface Update {
  Manager: string;
  Name: string;
  Current: string;
  Latest: string;
}

export interface Config {
  AutoUpdate: boolean;
  Notify: boolean;
  BackupPath: string;
  DefaultManager: string;
}
