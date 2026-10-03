/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { theme } from "../../theme.ts";

export interface DisconnectPopupProps {
  databases?: string[] | undefined;
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
}

export function DisconnectPopup({
  databases = [],
  onSubmit,
  onClose,
}: DisconnectPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboard((key) => {
    if (key.name === "escape") {
      onClose();
      return;
    }

    if (key.name === "up") {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, databases.length - 1)
      );
    } else if (key.name === "down") {
      setSelectedIndex((prev) =>
        prev < databases.length - 1 ? prev + 1 : 0
      );
    } else if (key.name === "return" || key.name == "enter") {
      if (databases.length > 0) {
        const selectedDb = databases[selectedIndex];
        if (selectedDb) onSubmit(selectedDb);
      }
    }
  });

  return (
    <box style={{ flexDirection: "column" }}>
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>🔌 Disconnect Database</strong>
        </text>
      </box>
      {databases.length === 0 ? (
        <box style={{ flexDirection: "column" }}>
          <text style={{ fg: theme.textSecondary }}>No databases connected.</text>
        </box>
      ) : (
        <box style={{ flexDirection: "column" }}>
          <box style={{ marginBottom: 1 }}>
            <text style={{ fg: theme.textSecondary }}>
              Select a database to disconnect:
            </text>
          </box>
          {databases.map((dbName, index) => {
            const isSelected = index === selectedIndex;
            return (
              <box
                key={dbName}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  paddingLeft: 1,
                  paddingRight: 1,
                }}
              >
                <text style={{ fg: isSelected ? theme.brandLight : theme.textSecondary }}>
                  {isSelected ? `► ${dbName}` : `  ${dbName}`}
                </text>
              </box>
            );
          })}
        </box>
      )}
      <box style={{ marginTop: 1 }}>
        <text style={{ fg: theme.textDim }}>
          Use ↑/↓ to navigate · [Enter] to disconnect · [Esc] to cancel
        </text>
      </box>
    </box>
  );
}
