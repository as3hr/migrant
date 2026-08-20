export function getDbName(dbUrl: string): string {
    const url = new URL(dbUrl);
    const dbName = url.hostname;
    return dbName;
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