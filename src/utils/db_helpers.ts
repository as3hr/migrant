export function getDbName(dbUrl: string): string {
    const url = new URL(dbUrl);
    const dbName = url.hostname;
    return dbName;
}