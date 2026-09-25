/** @jsxImportSource @opentui/react */
import { theme } from "../../theme.ts";

export interface SessionOverviewCardProps {
  databases?: string[] | undefined;
  sessionName?: string | undefined;
}

export function DatabaseCard({ databases = [], sessionName }: SessionOverviewCardProps) {
  return (
    <box
      style={{
        flexDirection: "column",
        paddingLeft: 1,
        paddingRight: 1,
        paddingTop: 1,
        paddingBottom: 1,
        marginBottom: 1,
        border: true,
        borderColor: theme.borderPrimary,
      }}
    >
      {/* Session Title Section */}
      {sessionName && (
        <box style={{ flexDirection: "column", marginBottom: 1 }}>
          <text style={{ fg: theme.accent }}>
            <strong>💬 Active Session</strong>
          </text>
          <text style={{ fg: theme.brandLight, truncate: true }}>
            <strong>{sessionName}</strong>
          </text>
        </box>
      )}
      
      {/* Connected Databases Section */}
      <box style={{ flexDirection: "column" }}>
        <text style={{ fg: theme.brand }}>
          <strong>🗄  Connected Databases</strong>
        </text>

        {databases.length === 0 ? (
          <box style={{ marginTop: 1 }}>
            <text style={{ fg: theme.textDim }}>No active PostgreSQL pool</text>
          </box>
        ) : (
          <box style={{ flexDirection: "column", marginTop: 1 }}>
            {databases.map((dbName) => (
              <box key={dbName} style={{ flexDirection: "row" }}>
                <text style={{ fg: theme.success }}>●  </text>
                <text style={{ fg: theme.textPrimary }}>
                  <strong>{dbName}</strong>
                </text>
              </box>
            ))}
          </box>
        )}
      </box>
    </box>
  );
}
