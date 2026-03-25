import type { Command } from '../types/index.ts';

export abstract class BaseCommand implements Command {
  abstract name: string;
  abstract description: string;
  aliases?: string[] = [];
  options?: { flags: string; description: string }[] = [];

  protected validateArgs(args: string[], required: number, usage: string): void {
    if (args.length < required) {
      throw new Error(`Missing required argument. Usage: pm ${usage}`);
    }
  }

  execute(args: string[], options?: Record<string, string>): Promise<void> {
    throw new Error('Not implemented');
  }
}

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.name, command);
    command.aliases?.forEach(alias => this.commands.set(alias, command));
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  has(name: string): boolean {
    return this.commands.has(name);
  }

  all(): Command[] {
    return Array.from(this.commands.values());
  }

  list(): [string, string][] {
    const seen = new Set<string>();
    return this.all()
      .filter(cmd => {
        if (seen.has(cmd.name)) return false;
        seen.add(cmd.name);
        return true;
      })
      .map(cmd => [cmd.name, cmd.description] as [string, string]);
  }
}

export const registry = new CommandRegistry();
