/** @jsxImportSource @opentui/react */
import { useStdoutDimensions } from "../../hooks/index.ts";
import { theme } from "../../theme.ts";
import { Spinner } from "../spinner.tsx";

export function AuthCheckingView() {
  const dimensions = useStdoutDimensions();
  return (
    <box
      style={{
        height: dimensions.height,
        width: dimensions.width,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
        backgroundColor: theme.bgCanvas,
      }}
    >
      <Spinner label="Checking authentication session..." />
    </box>
  );
}
