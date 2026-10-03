import type { JSX } from "react";
import { InputPopup } from "./input_popup.tsx";

export interface RenameSessionPopupProps {
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
}

export function RenameSessionPopup({ onSubmit, onClose }: RenameSessionPopupProps): JSX.Element {
  return (
    <InputPopup
      title="✏️ Rename Chat Session"
      description="Enter the new name for your chat session:"
      placeholder="e.g. Debugging the Auth Flow"
      submitLabel="rename"
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}
