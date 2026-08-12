export function getDbName(dbUrl: string): string {
    const url = new URL(dbUrl);
    const dbName = url.pathname.slice(1);
    return dbName;
}