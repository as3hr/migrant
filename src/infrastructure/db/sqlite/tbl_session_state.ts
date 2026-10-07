import { sqlClient } from "./sqlite.client.ts";

export interface ISessionState {
    indexed: string[];
    comparisons: {
        between: string[];
        onlyInDb: Record<string, string[]>;
        structuralDiffs: Record<string, string[]>;
    }[];
}

class TblSessionState {
    private upsertStmt: any;
    private selectStmt: any;

    initializeTblSessionState() {
        sqlClient.run(`
            CREATE TABLE IF NOT EXISTS tbl_session_state (
                session_id TEXT PRIMARY KEY,
                state TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        this.upsertStmt = sqlClient.prepare(
            `INSERT INTO tbl_session_state (session_id, state, updated_at) 
             VALUES (?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(session_id) DO UPDATE SET 
             state = excluded.state, 
             updated_at = CURRENT_TIMESTAMP`
        );

        this.selectStmt = sqlClient.prepare(
            `SELECT state FROM tbl_session_state WHERE session_id = ?`
        );
    }

    upsertState(sessionId: string, state: ISessionState): void {
        this.upsertStmt.run(sessionId, JSON.stringify(state));
    }

    getState(sessionId: string): ISessionState | undefined {
        const row = this.selectStmt.get(sessionId) as { state: string } | undefined;
        if (!row) return undefined;
        return JSON.parse(row.state) as ISessionState;
    }
}

export const tblSessionState = new TblSessionState();