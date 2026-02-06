import initSqlJs, { type Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', '..', 'data', 'blog.db');

let db: Database;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  try {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } catch {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Valid SQLite parameter types
type SqlParam = string | number | null | Uint8Array;

// Helper to run a query and return all rows
export function dbAll<T = Record<string, unknown>>(sql: string, params: SqlParam[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

// Helper to run a query and return first row
export function dbGet<T = Record<string, unknown>>(sql: string, params: SqlParam[] = []): T | undefined {
  const results = dbAll<T>(sql, params);
  return results[0];
}

// Helper to run an INSERT/UPDATE/DELETE and return changes + lastInsertRowid
export function dbRun(sql: string, params: SqlParam[] = []): { changes: number; lastInsertRowid: number } {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lastRow = dbGet<{ id: number }>('SELECT last_insert_rowid() as id');
  saveDb();
  return { changes, lastInsertRowid: lastRow?.id || 0 };
}

// Helper to run multiple statements (for schema creation)
export function dbExec(sql: string): void {
  db.run(sql);
  saveDb();
}

export default { getDb, saveDb, dbAll, dbGet, dbRun, dbExec };
