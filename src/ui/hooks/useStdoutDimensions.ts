import { useTerminalDimensions } from "@opentui/react";

export interface Dimensions {
    width: number;
    height: number;
}

export function useStdoutDimensions(): Dimensions {
    return useTerminalDimensions();
}
