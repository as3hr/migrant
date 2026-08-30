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
        if (key.ctrl && input.toLowerCase() === "c") {
            if (options.isStreaming && options.onCancelStream) {
                options.onCancelStream();
            } else if (options.onExit) {
                options.onExit();
            }
            return;
        }

        if (key.ctrl && input.toLowerCase() === "l") {
            options.onClear?.();
            return;
        }

        if (key.ctrl && input.toLowerCase() === "p") {
            options.onTogglePalette?.();
            return;
        }

        if (key.ctrl && input.toLowerCase() === "d") {
            options.onToggleDatabases?.();
            return;
        }

        if (key.upArrow) {
            options.onScrollUp?.();
            return;
        }

        if (key.downArrow) {
            options.onScrollDown?.();
            return;
        }
    });
}
