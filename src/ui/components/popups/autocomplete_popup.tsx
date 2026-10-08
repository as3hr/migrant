/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { theme } from "../../theme.ts";

export interface SlashCommandItem {
  name: string;
  argsHint?: string;
  description: string;
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    name: "connect",
    argsHint: "",
    description: "Connect & scan PostgreSQL database",
  },
  {
    name: "sessions",
    argsHint: "",
    description: "List & switch past chat sessions",
  },
  {
    name: "info",
    argsHint: "",
    description: "View system status and active databases",
  },
  {
    name: "models",
    argsHint: "",
    description: "Select AI Provider & Model",
  },
  {
    name: "logout",
    argsHint: "",
    description: "Logout from your Migrant account",
  },
  {
    name: "disconnect",
    argsHint: "",
    description: "Disconnect an active database",
  },
  {
    name: "rename-db",
    argsHint: "",
    description: "Assign a custom label to your database",
  },
  {
    name: "new",
    argsHint: "",
    description: "Start a new chat session",
  },
  {
    name: "rename",
    argsHint: "",
    description: "Rename the current chat session",
  },
  {
    name: "help",
    argsHint: "",
    description: "Show available commands & descriptions",
  },
];

export interface AutocompletePopupProps {
  input: string;
  onSelect: (completedText: string) => void;
  onHighlight?: (completedText: string | null) => void;
  onClose?: () => void;
}

export function AutocompletePopup({
  input,
  onSelect,
  onHighlight,
  onClose,
}: AutocompletePopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isSlashInput = input.startsWith("/");
  const searchQuery = isSlashInput
    ? input.slice(1).trim().toLowerCase()
    : "";

  const filteredCommands = isSlashInput
    ? SLASH_COMMANDS.filter((cmd) =>
        cmd.name.toLowerCase().startsWith(searchQuery)
      )
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (isSlashInput && filteredCommands.length > 0) {
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        onHighlight?.(`/${selected.name} `);
      } else {
        onHighlight?.(null);
      }
    } else {
      onHighlight?.(null);
    }
  }, [input, selectedIndex, filteredCommands.length, isSlashInput]);

  useKeyboard((key) => {
    if (!isSlashInput || filteredCommands.length === 0) return;

    if (key.name === "up") {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (key.name === "down") {
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (key.name === "tab" || key.name === "enter" || key.name === "return") {
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        onSelect(`/${selected.name} `);
      }
    } else if (key.name === "escape") {
      onClose?.();
    }
  });

  if (!input.startsWith("/") || filteredCommands.length === 0) {
    return null;
  }

  return (
    <box
      style={{
        flexDirection: "column",
        borderStyle: "rounded",
        borderColor: theme.accent,
        backgroundColor: theme.bgPopup,
        paddingLeft: 2,
        paddingRight: 2,
        marginBottom: 1,
      }}
    >
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: theme.textSecondary }}>
          Use ↑/↓ to navigate, Tab to complete
        </text>
      </box>

      {filteredCommands.map((cmd, index) => {
        const isSelected = index === selectedIndex;
        return (
          <box key={cmd.name} style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <box style={{ flexDirection: "row" }}>
              <text style={{ fg: isSelected ? theme.brandLight : theme.textSecondary }}>
                {isSelected ? `► /${cmd.name}` : `  /${cmd.name}`}
              </text>
              {cmd.argsHint ? (
                <text style={{ fg: theme.textDim }}>{` ${cmd.argsHint}`}</text>
              ) : null}
            </box>
            <text style={{ fg: isSelected ? theme.textPrimary : theme.textDim }}>{cmd.description}</text>
          </box>
        );
      })}
    </box>
  );
}
