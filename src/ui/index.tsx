/** @jsxImportSource @opentui/react */
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Shell } from "./shell.tsx";

const renderer = await createCliRenderer({ exitOnCtrlC: true });

function exit() {
  renderer.stop();
  process.exit(0);
}

const root = createRoot(renderer);
root.render(<Shell onExit={exit} />);