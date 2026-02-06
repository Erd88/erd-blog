declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: (string | number | null | Uint8Array)[]): void;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    getRowsModified(): number;
    close(): void;
  }

  export interface Statement {
    bind(params: (string | number | null | Uint8Array)[]): boolean;
    step(): boolean;
    get(): (string | number | null | Uint8Array)[];
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }

  export default function initSqlJs(): Promise<SqlJsStatic>;
}
