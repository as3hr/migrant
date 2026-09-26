/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { appContext } from "../../../domain/app_context.ts";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";

export interface SessionsPopupProps {
  sessions?: IChatSessionsModel[] | undefined;
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
}

export function SessionsPopup({
  sessions = [],
  onSubmit,
  onClose,
}: SessionsPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeSessions = sessions ?? [];

  useKeyboard((key) => {
    if (key.name === "escape") {
      onClose();
      return;
    }

    if (key.name === "up") {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, activeSessions.length - 1)
      );
    } else if (key.name === "down") {
      setSelectedIndex((prev) =>
        prev < activeSessions.length - 1 ? prev + 1 : 0
      );
    } else if (key.name === "return" || key.name == "enter") {
      if (activeSessions.length > 0) {
        const selectedSession = activeSessions[selectedIndex];
        appContext.commandCtx?.log(
          `CommandParameterPopup: selected session: ${selectedSession?.id}`
        );
        if (selectedSession) onSubmit(selectedSession.id);
      }
    }
  });

  return (
    <box style={{ flexDirection: "column" }}>
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>📜 Select Chat Session</strong>
        </text>
      </box>
      {activeSessions.length === 0 ? (
        <box style={{ flexDirection: "column" }}>
          <text style={{ fg: theme.textSecondary }}>No past sessions recorded.</text>
        </box>
      ) : (
        <box style={{ flexDirection: "column" }}>
          <box style={{ marginBottom: 1 }}>
            <text style={{ fg: theme.textSecondary }}>
              Select a session to switch history:
            </text>
          </box>
          {activeSessions.map((sess, index) => {
            const isSelected = index === selectedIndex;
            return (
              <box
                key={sess.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  paddingLeft: 1,
                  paddingRight: 1,
                }}
              >
                <box style={{ flexDirection: "row" }}>
                  <text style={{ fg: isSelected ? theme.brandLight : theme.textSecondary }}>
                    {isSelected ? `► ${sess.title || "Untitled Session"}` : `  ${sess.title || "Untitled Session"}`}
                  </text>
                </box>
                <text style={{ fg: isSelected ? theme.textPrimary : theme.textDim }}>
                  {`${sess.session_token_used} tokens`}
                </text>
              </box>
            );
          })}
        </box>
      )}
      <box style={{ marginTop: 1 }}>
        <text style={{ fg: theme.textDim }}>
          Use ↑/↓ to navigate · [Enter] to switch · [Esc] to cancel
        </text>
      </box>
    </box>
  );
}
