import type { OutputItem } from "../ui/components/output.tsx";
import type { ParameterCommandType } from "../ui/components/popups/index.ts";

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
    startAssistantStream?(): void;
    updateAssistantStream?(data: { text: string; reasoning: string }): void;
    replaceLastWithItem?(item: OutputItem): void;
    output?(item: OutputItem): void;
    success(text: string): void;
    error(text: string): void;
    clear(): void;
    exit(): void;
    busy(label: string): void;
    openPopup?(type: ParameterCommandType): void;
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