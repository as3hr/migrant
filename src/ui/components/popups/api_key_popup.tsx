import type { JSX } from "react";
import { InputPopup } from "./input_popup.tsx";

export interface ApiKeyPopupProps {
  providerName: string;
  apiKeyEnv: string;
  onSubmit: (apiKey: string) => void;
  onClose: () => void;
}

export function ApiKeyPopup({
  providerName,
  apiKeyEnv,
  onSubmit,
  onClose,
}: ApiKeyPopupProps): JSX.Element {
  return (
    <InputPopup
      title={`🔑 Enter ${providerName} API Key`}
      description={`Enter API key for ${providerName} (${apiKeyEnv}):`}
      placeholder={`Paste ${providerName} API key...`}
      mask="*"
      submitLabel="save key"
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}
