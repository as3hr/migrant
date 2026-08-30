import { useInput } from "ink";

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
    useInput((input, key) => {
        // Ctrl + C: Cancel active stream or exit CLI
        if (key.ctrl && input.toLowerCase() === "c") {
            if (options.isStreaming && options.onCancelStream) {
                options.onCancelStream();
            } else if (options.onExit) {
                options.onExit();
            }
            return;
        }

        // Ctrl + L: Clear terminal screen & outputs
        if (key.ctrl && input.toLowerCase() === "l") {
            options.onClear?.();
            return;
        }

        // Ctrl + P: Toggle Command Palette / Slash Autocomplete
        if (key.ctrl && input.toLowerCase() === "p") {
            options.onTogglePalette?.();
            return;
        }

        // Ctrl + D: Toggle Active Databases Modal / View
        if (key.ctrl && input.toLowerCase() === "d") {
            options.onToggleDatabases?.();
            return;
        }

        // PageUp: Scroll Chat Transcript Up
        if (key.pageUp) {
            options.onScrollUp?.();
            return;
        }

        // PageDown: Scroll Chat Transcript Down
        if (key.pageDown) {
            options.onScrollDown?.();
            return;
        }
    });
}
