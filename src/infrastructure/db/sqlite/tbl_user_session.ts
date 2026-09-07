import { sqlClient } from "./sqlite.client.ts";

interface IUserSession {
    user_id: string;
    session_data: string;
}

export class TblUserSession {
    private sessionInsertStmt;
    private sessionSelectStmt;
    private sessionDeleteStmt;

    constructor() {
        this.sessionInsertStmt = sqlClient.prepare(
            'INSERT OR REPLACE INTO user_sessions (user_id, session_data) VALUES (?, ?)'
        );
        this.sessionSelectStmt = sqlClient.prepare(
            'SELECT * FROM user_sessions'
        );
        this.sessionDeleteStmt = sqlClient.prepare(
            'DELETE FROM user_sessions WHERE user_id = ?'
        );
    }

    initializeTblUserSessions() {
        sqlClient.run(`
            CREATE TABLE IF NOT EXISTS user_sessions (
              user_id TEXT PRIMARY KEY,
              session_data TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    setSession(userId: string, sessionData: string): void { 
        this.sessionInsertStmt.run(userId, sessionData); 
    }

    getUserSession() { 
        return this.sessionSelectStmt.get() as IUserSession | undefined;
    }

    deleteSession(userId: string): boolean {
        const info = this.sessionDeleteStmt.run(userId);
        return info.changes > 0;
    }
}

export const tblUserSession = new TblUserSession();