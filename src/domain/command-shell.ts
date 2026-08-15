export interface CommandDefinition {
    name: string;
    description: string;
    usage?: string;
    requiresAuth?: boolean;
    requiresConnection?: boolean;
    busyLabel?: string;
    execute: CommandExecute;
  }
  
  export type CommandExecute = (
    args: string,
    ctx: CommandContext,
  ) => Promise<void> | void;
  
  export interface AskOptions {
    placeholder?: string;
    mask?: string;
  }
  
  export interface CommandContext {
    ask(label: string, options?: AskOptions): Promise<string>;
    log(text: string): void;
    replaceLast(text: string): void;
    success(text: string): void;
    error(text: string): void;
    clear(): void;
    exit(): void;
    busy(label: string): void;
  }
  
  export class CommandRegistry {
    private readonly commands = new Map<string, CommandDefinition>();
  
    register(command: CommandDefinition): void {
      this.commands.set(command.name, command);
    }
  
    get(name: string): CommandDefinition | undefined {
      return this.commands.get(name);
    }
  
    list(): CommandDefinition[] {
      return [...this.commands.values()];
    }
}