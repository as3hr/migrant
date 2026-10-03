export function getDbName(dbUrl: string): string {
  try {
    const url = new URL(dbUrl);
    const dbName = url.pathname.replace(/^\//, "");
    const host = url.hostname;
    return `${host}/${decodeURIComponent(dbName) || "postgres"}`;
  } catch {
    return dbUrl;
  }
}

export function hasDatabaseChanged(
  storedMigrations: string[],
  currentMigrations: string[]
): boolean {
  if (storedMigrations.length !== currentMigrations.length) {
    return true;
  }

  const stored = new Set(storedMigrations);
  return currentMigrations.some(
    migration => !stored.has(migration)
  );
}

export function isLocalConnection(dbUrl: string): boolean {
  try {
    const url = new URL(dbUrl);
    const host = url.hostname || url.searchParams.get("host") || "";
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "" ||
      host.startsWith("/")
    );
  } catch {
    return false;
  }
}