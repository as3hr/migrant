/** @jsxImportSource @opentui/react */
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Shell } from "./shell.tsx";

const renderer = await createCliRenderer({ exitOnCtrlC: false });

function exit() {
  renderer.destroy();
  process.exit(0);
}

const root = createRoot(renderer);
root.render(<Shell onExit={exit} />);