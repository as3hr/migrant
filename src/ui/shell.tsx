import { Box } from "ink";
import type { JSX } from "react";
import { Output } from "./components/output.tsx";
import { Prompt } from "./components/prompt.tsx";
import { Spinner } from "./components/spinner.tsx";
import { useShell } from "./hooks/useShell.ts";

interface ShellProps {
  onExit: () => void;
}

export function Shell({ onExit }: ShellProps): JSX.Element {
  const {
    outputs,
    input,
    setInput,
    run,
    dimensions,
    user,
    databases,
    spinnerVisible,
    formInputProps,
    handleSubmit,
  } = useShell(onExit);

  return (
    <Box flexDirection="column" width={dimensions.width}
    height={dimensions.height}>

      {/* Output */}
      <Box flexDirection="column" width={dimensions.width}>
        {outputs.map((item, index) => (
          <Box key={index} width={dimensions.width}>
            <Output item={item} />
          </Box>
        ))}
      </Box>

      {/* Spinner */}
      {run.kind === "running" && spinnerVisible && (
        <Box width={dimensions.width} marginTop={1}>
          <Spinner label={run.label} />
        </Box>
      )}

      <Box width={dimensions.width} marginTop={1}>
        {run.kind === "idle" && (
          <Prompt
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            {...(user !== undefined ? { user } : {})}
            {...(databases !== undefined ? { databases } : {})}
          />
        )}

        {run.kind === "form" && (
          <Prompt
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            label={run.label}
            {...(formInputProps.placeholder !== undefined ? { placeholder: formInputProps.placeholder } : {})}
            {...(formInputProps.mask !== undefined ? { mask: formInputProps.mask } : {})}
          />
        )}
      </Box>

    </Box>
  );
}
