const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');

let SQL = null;
let db = null;
let dbPath = null;

async function init(filePath) {
  dbPath = filePath;
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: file => require.resolve(`sql.js/dist/${file}`)
    });
  }

  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  setMeta('schema_version', '1');
  persist();
  return { path: dbPath };
}

function ensureReady() {
  if (!db || !dbPath) throw new Error('SQLite storage is not initialized.');
}

function persist() {
  ensureReady();
  fs.mkdirSync(path.dirname(dbPath), { recursive:true });
  const bytes = db.export();
  const temp = `${dbPath}.tmp`;
  fs.writeFileSync(temp, Buffer.from(bytes));
  try { fs.renameSync(temp, dbPath); }
  catch {
    try { fs.rmSync(dbPath, { force:true }); } catch {}
    fs.renameSync(temp, dbPath);
  }
}

function setMeta(key, value) {
  ensureReady();
  db.run(
    'INSERT INTO app_meta(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    [String(key), String(value)]
  );
}

function getMeta(key, fallback = null) {
  ensureReady();
  const stmt = db.prepare('SELECT value FROM app_meta WHERE key = ?');
  stmt.bind([String(key)]);
  const value = stmt.step() ? stmt.getAsObject().value : fallback;
  stmt.free();
  return value ?? fallback;
}

function setJson(key, value) {
  ensureReady();
  db.run(
    'INSERT INTO app_state(key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at',
    [String(key), JSON.stringify(value), new Date().toISOString()]
  );
  persist();
  return value;
}

function getJson(key, fallback = null) {
  ensureReady();
  const stmt = db.prepare('SELECT value FROM app_state WHERE key = ?');
  stmt.bind([String(key)]);
  if (!stmt.step()) {
    stmt.free();
    return fallback;
  }
  const raw = stmt.getAsObject().value;
  stmt.free();
  try { return JSON.parse(raw); }
  catch { return fallback; }
}

function has(key) {
  ensureReady();
  const stmt = db.prepare('SELECT 1 AS yes FROM app_state WHERE key = ? LIMIT 1');
  stmt.bind([String(key)]);
  const result = stmt.step();
  stmt.free();
  return result;
}

function getPath() { return dbPath; }

module.exports = { init, setJson, getJson, has, setMeta, getMeta, persist, getPath };
