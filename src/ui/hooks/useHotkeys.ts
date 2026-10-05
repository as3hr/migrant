import { createClipboard, createHostClipboard, createRendererClipboardAdapter } from "@opentui/core";
import { useAppContext, useKeyboard } from "@opentui/react";
import { useMemo } from "react";

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
    const app = useAppContext();
    const clipboard = useMemo(() => {
        return createClipboard({
            host: createHostClipboard(),
            terminal: createRendererClipboardAdapter(app.renderer as any),
        });
    }, [app.renderer]);

    useKeyboard((key) => {
        if (app.renderer) {
            if (key.ctrl && key.name === "c") {
                const container = app.renderer.getSelectionContainer();
                if (container && container.hasSelection()) {
                    const text = container.getSelectedText();
                    if (text) {
                        void clipboard.writeText(text, { destination: "best-available" });
                        app.renderer.clearSelection();
                    }
                    return;
                }
                if (options.isStreaming && options.onCancelStream) {
                    options.onCancelStream();
                } else if (options.onExit) {
                    options.onExit();
                }
                return;
            }
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
