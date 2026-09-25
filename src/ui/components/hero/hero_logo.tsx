/** @jsxImportSource @opentui/react */
import { theme } from "../../theme.ts";

export function HeroLogo() {
  return (
    <box style={{ flexDirection: "column", alignItems: "center", marginBottom: 1 }}>
      <text style={{ fg: theme.brand }}>
        <strong>{`
   __  ___ ________  ___  ___  _  ______
  /  |/  //  _/ ___// _ \\/ _ \\/ |/ /_  __/
 / /|_/ /_/ // (_ / /_/ / __ /    / / /   
/_/  /_//___/\\___/\\____/_/ |_/_/|_/ /_/    
        `}</strong>
      </text>
      <box style={{ marginTop: 1 }}>
        <text style={{ fg: theme.accent }}>
          <strong>PostgreSQL Schema Intelligence & Agent System</strong>
        </text>
      </box>
    </box>
  );
}
