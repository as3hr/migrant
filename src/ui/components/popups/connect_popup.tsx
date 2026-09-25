import type { JSX } from "react";
import { InputPopup } from "./input_popup.tsx";

export interface ConnectPopupProps {
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
}

export function ConnectPopup({ onSubmit, onClose }: ConnectPopupProps): JSX.Element {
  return (
    <InputPopup
      title="🔌 Connect PostgreSQL Database"
      description="Enter connection URL (e.g. postgres://user:pass@localhost:5432/dbname):"
      placeholder="postgres://username:password@host:5432/database"
      submitLabel="connect"
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}
