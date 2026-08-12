import { Text } from "ink";
import type { JSX } from "react";

interface StatusProps {
  user?: string;
  database?: string;
}

export function Status({ user, database }: StatusProps): JSX.Element | null {
  const parts: string[] = [];

  if (user) {
    parts.push(`logged in as ${user}`);
  }

  if (database) {
    parts.push(`connected to ${database}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return <Text dimColor>{parts.join("  •  ")}</Text>;
}