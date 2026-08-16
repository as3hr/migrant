import { sqlLite } from "@src/infrastructure/clients/sqllite.client.ts";

interface SessionRow {
    user_id: string;
    session_data: string;
}

export class LocalSessionRepository {
    private sessionInsertStmt;
    private sessionSelectStmt;
    private sessionDeleteStmt;

    constructor() {
        this.sessionInsertStmt = sqlLite.prepare(
            'INSERT OR REPLACE INTO sessions (user_id, session_data) VALUES (?, ?)'
        );
        this.sessionSelectStmt = sqlLite.prepare(
            'SELECT * FROM sessions'
        );
        this.sessionDeleteStmt = sqlLite.prepare(
            'DELETE FROM sessions WHERE user_id = ?'
        );
    }

    setSession(userId: string, sessionData: string): void { 
        this.sessionInsertStmt.run(userId, sessionData); 
    }

    getUserSession() { 
        return this.sessionSelectStmt.get() as SessionRow | undefined;
    }

    deleteSession(userId: string): boolean {
        const info = this.sessionDeleteStmt.run(userId);
        return info.changes > 0;
    }
}