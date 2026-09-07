import { Database } from "bun:sqlite";
import { tblChatMessage } from "./tbl_chat_message.ts";
import { tblChatSessions } from "./tbl_chat_sessions.ts";
import { tblDatabases } from "./tbl_databases.ts";
import { tblDocuments } from "./tbl_documents.ts";
import { tblProvider } from "./tbl_provider.ts";
import { tblUserSession } from "./tbl_user_session.ts";

export const sqlClient: Database = new Database('migrant.db');

tblChatMessage.initializeTblChatMessage();
tblChatSessions.initializeTblChatSessions();
tblProvider.initializeTblProvider();
tblDatabases.initializeTblDatabases();
tblUserSession.initializeTblUserSessions();
tblDocuments.initializeTblDocuments();
