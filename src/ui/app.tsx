import { useApp } from "ink";
import type { JSX } from "react";
import { Shell } from "./shell.tsx";

export default function App(): JSX.Element {
  const { exit } = useApp();

  return <Shell onExit={() => exit()} />;
}