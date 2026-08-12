import { Text } from "ink";
import type { JSX } from "react";

interface StatusProps {
  user?: string;
  databases?: string[];
}
interface StatusProps {
  user?: string;
  databases?: string[];
}

export function Status({ user, databases }: StatusProps): JSX.Element {
  const username = user?.split("@")[0];

  return (
    <Text dimColor>
      {username ? `$${username} ` : ""}
      {databases?.length ? `[${databases.join(", ")}] ` : ""}
      &gt;
    </Text>
  );
}