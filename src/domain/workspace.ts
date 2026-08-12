import { getDbName } from "@src/exports.ts";

export type DatabaseType = "postgres" | "my-sql" | "mongodb"

export interface DatabaseCollection { 
    id: string;
    name: string;
    connectionString: string;
    type: DatabaseType;
    lastScannedAt?: Date;
    lastSchemaCheckAt?: Date;
}

export class WorkSpace { 
    activeDbId: string = '';
    databases: DatabaseCollection[] = [];

    addDbToWorkspace(dbUrl: string, dbId: string) {
        this.databases.push({
            id: dbId,
            name: getDbName(dbUrl),
            connectionString: dbUrl,
            type: "postgres",
        });
    }

    setActiveDbId(dbId: string) {
        this.activeDbId = dbId;
    }

    removeDbFromWorkSpace(dbId: string) {
        this.databases = this.databases.filter((db) => db.id != dbId).map((db) => db);
    }

    setLastScanTimeOfDb(dbId: string) {
        this.databases = this.databases.map((db) => {
            if (db.id == dbId) {
                db = {
                    ...db,
                    lastScannedAt: new Date()
                }
            }
            return db;
        });        
    }

    setLastSchemaTimeOfDb(dbId: string) {
        this.databases = this.databases.map((db) => {
            if (db.id == dbId) {
                db = {
                    ...db,
                    lastSchemaCheckAt: new Date()
                }
            }
            return db;
        });        
    }

    dbExists(dbUrl: string): boolean {
        const db = this.databases.find((db) => db.connectionString == dbUrl);
        return db != undefined;
    }
}