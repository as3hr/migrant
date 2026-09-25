import { useKeyboard } from "@opentui/react";

export interface UseHotkeysOptions {
    onExit?: () => void;
    onClear?: () => void;
    onTogglePalette?: () => void;
    onToggleDatabases?: () => void;
    onScrollUp?: () => void;
    onScrollDown?: () => void;
    isStreaming?: boolean;
    onCancelStream?: () => void;
}

export function useHotkeys(options: UseHotkeysOptions): void {
    useKeyboard((key) => {
        if (key.ctrl && key.name === "c") {
            if (options.isStreaming && options.onCancelStream) {
                options.onCancelStream();
            } else if (options.onExit) {
                options.onExit();
            }
            return;
        }

        if (key.ctrl && key.name === "l") {
            options.onClear?.();
            return;
        }

        if (key.ctrl && key.name === "p") {
            options.onTogglePalette?.();
            return;
        }

        if (key.ctrl && key.name === "d") {
            options.onToggleDatabases?.();
            return;
        }

        if (key.name === "up") {
            options.onScrollUp?.();
            return;
        }

        if (key.name === "down") {
            options.onScrollDown?.();
            return;
        }
    });
}
