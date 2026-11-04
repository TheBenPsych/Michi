// Minimal Node types for tests (the app itself doesn't use Node).
declare module 'node:fs' { export function existsSync(p: string): boolean; export function writeFileSync(p: string, d: string): void }
declare const process: { env: Record<string, string | undefined> };
