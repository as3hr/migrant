export function getDbName(dbUrl: string): string {
  try {
    const url = new URL(dbUrl);
    const dbName = url.pathname.replace(/^\//, "");
    const host = url.hostname;
    
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const timeSuffix = `${mm}${dd}-${hh}${min}`;

    return `${host}/${decodeURIComponent(dbName) || "postgres"}-${timeSuffix}`;
  } catch {
    const now = new Date();
    return `${dbUrl}-${now.getTime().toString(36)}`;
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