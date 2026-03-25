const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'board.db');
const OLD_JSON = path.join(__dirname, 'data', 'tasks.json');

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let db; // sql.js Database instance

/* ---------- DB helpers ---------- */
function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function rowToTask(r) {
  return {
    id: r.id,
    title: r.title,
    desc: r.desc,
    tags: r.tags ? JSON.parse(r.tags) : [],
    priority: r.priority,
    type: r.type,
    status: r.status,
    dependency: r.dependency || '',
    releaseTime: r.releaseTime || '',
    risk: !!r.risk,
    marker: r.marker || '',
    subtasks: r.subtasks ? JSON.parse(r.subtasks) : [],
    recurrence: r.recurrence ? JSON.parse(r.recurrence) : null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    lastMoved: r.lastMoved,
  };
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
}

/* ---------- Schema ---------- */
function initSchema() {
  run(`CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL DEFAULT '',
    desc        TEXT DEFAULT '',
    tags        TEXT DEFAULT '[]',
    priority    TEXT DEFAULT 'P3',
    type        TEXT DEFAULT 'feature',
    status      TEXT DEFAULT 'backlog',
    dependency  TEXT DEFAULT '',
    releaseTime TEXT DEFAULT '',
    risk        INTEGER DEFAULT 0,
    marker      TEXT DEFAULT '',
    subtasks    TEXT DEFAULT '[]',
    recurrence  TEXT DEFAULT '',
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL,
    lastMoved   TEXT NOT NULL
  )`);

  run(`CREATE TABLE IF NOT EXISTS task_history (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId    TEXT NOT NULL,
    action    TEXT NOT NULL,
    field     TEXT DEFAULT '',
    oldValue  TEXT DEFAULT '',
    newValue  TEXT DEFAULT '',
    snapshot  TEXT DEFAULT '',
    timestamp TEXT NOT NULL
  )`);

  run(`CREATE INDEX IF NOT EXISTS idx_history_taskId ON task_history(taskId)`);
  run(`CREATE INDEX IF NOT EXISTS idx_history_timestamp ON task_history(timestamp)`);

  // Migrate: add subtasks column if missing
  try { run('ALTER TABLE tasks ADD COLUMN subtasks TEXT DEFAULT \'[]\''); } catch { /* already exists */ }
  // Migrate: add recurrence column if missing
  try { run('ALTER TABLE tasks ADD COLUMN recurrence TEXT DEFAULT \'\''); } catch { /* already exists */ }

  saveDB();
}

/* ---------- Migrate from JSON ---------- */
function migrateFromJSON() {
  if (!fs.existsSync(OLD_JSON)) return;
  let items;
  try {
    items = JSON.parse(fs.readFileSync(OLD_JSON, 'utf-8'));
  } catch { return; }
  if (!Array.isArray(items) || items.length === 0) return;

  const existing = queryAll('SELECT COUNT(*) as cnt FROM tasks');
  if (existing[0].cnt > 0) return; // already have data

  const stmt = db.prepare(`INSERT OR IGNORE INTO tasks
    (id, title, desc, tags, priority, type, status, dependency, releaseTime, risk, marker, subtasks, recurrence, createdAt, updatedAt, lastMoved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  for (const t of items) {
    stmt.run([
      t.id, t.title || '', t.desc || '',
      JSON.stringify(t.tags || []),
      t.priority || 'P3', t.type || 'feature', t.status || 'backlog',
      t.dependency || '', t.releaseTime || '',
      t.risk ? 1 : 0, t._marker || t.marker || '',
      JSON.stringify(t.subtasks || []),
      JSON.stringify(t.recurrence || ''),
      t.createdAt || new Date().toISOString(),
      t.updatedAt || new Date().toISOString(),
      t.lastMoved || new Date().toISOString().slice(0, 10),
    ]);
  }
  stmt.free();

  const now = new Date().toISOString();
  for (const t of items) {
    run(`INSERT INTO task_history (taskId, action, field, oldValue, newValue, snapshot, timestamp)
         VALUES (?, 'migrated', '', '', '', ?, ?)`,
      [t.id, JSON.stringify(t), now]);
  }

  saveDB();
  fs.renameSync(OLD_JSON, OLD_JSON + '.bak');
  console.log(`Migrated ${items.length} tasks from JSON to SQLite`);
}

/* ---------- Record history ---------- */
function recordHistory(taskId, action, changes, snapshot) {
  const now = new Date().toISOString();
  if (changes && changes.length > 0) {
    for (const c of changes) {
      run(`INSERT INTO task_history (taskId, action, field, oldValue, newValue, snapshot, timestamp)
           VALUES (?, ?, ?, ?, ?, '', ?)`,
        [taskId, action, c.field, String(c.oldValue), String(c.newValue), now]);
    }
  } else {
    run(`INSERT INTO task_history (taskId, action, field, oldValue, newValue, snapshot, timestamp)
         VALUES (?, ?, '', '', '', ?, ?)`,
      [taskId, action, snapshot ? JSON.stringify(snapshot) : '', now]);
  }
  saveDB();
}

/* ---------- Backend Validation ---------- */
const VALID_PRIORITIES = ['P1', 'P2', 'P3'];
const VALID_TYPES = ['feature', 'bug', 'idea'];
const VALID_STATUSES = ['backlog', 'todo', 'dev', 'done', 'publish'];
const LIMITS = { title: 200, desc: 2000, tags: 20, tagItem: 50, dependency: 200 };

function validateTask(body, isCreate = false) {
  const errors = [];

  if (isCreate || body.title !== undefined) {
    const title = (body.title || '').trim();
    if (isCreate && !title) errors.push('Title is required');
    if (title && title.length > LIMITS.title) errors.push(`Title max ${LIMITS.title} chars`);
  }

  if (body.desc !== undefined && body.desc.length > LIMITS.desc) {
    errors.push(`Description max ${LIMITS.desc} chars`);
  }

  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`Invalid priority: ${body.priority}`);
  }

  if (body.type !== undefined && !VALID_TYPES.includes(body.type)) {
    errors.push(`Invalid type: ${body.type}`);
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Invalid status: ${body.status}`);
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('Tags must be an array');
    } else {
      if (body.tags.length > LIMITS.tags) errors.push(`Max ${LIMITS.tags} tags`);
      for (const tag of body.tags) {
        if (typeof tag !== 'string') { errors.push('Each tag must be a string'); break; }
        if (tag.length > LIMITS.tagItem) { errors.push(`Tag too long (max ${LIMITS.tagItem} chars)`); break; }
      }
    }
  }

  if (body.dependency !== undefined && body.dependency.length > LIMITS.dependency) {
    errors.push(`Dependency max ${LIMITS.dependency} chars`);
  }

  if (body.subtasks !== undefined) {
    if (!Array.isArray(body.subtasks)) {
      errors.push('Subtasks must be an array');
    } else if (body.subtasks.length > 50) {
      errors.push('Max 50 subtasks');
    }
  }

  return errors;
}

/* ---------- API routes ---------- */

// GET all tasks
app.get('/api/tasks', (_req, res) => {
  const rows = queryAll('SELECT * FROM tasks ORDER BY updatedAt DESC');
  res.json(rows.map(rowToTask));
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const rows = queryAll('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(rowToTask(rows[0]));
});

// GET task history
app.get('/api/tasks/:id/history', (req, res) => {
  const rows = queryAll(
    'SELECT * FROM task_history WHERE taskId = ? ORDER BY timestamp DESC',
    [req.params.id]
  );
  res.json(rows);
});

// GET global history (recent)
app.get('/api/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const rows = queryAll(
    `SELECT h.*, t.title as taskTitle FROM task_history h
     LEFT JOIN tasks t ON h.taskId = t.id
     ORDER BY h.timestamp DESC LIMIT ?`,
    [limit]
  );
  res.json(rows);
});

// GET analytics data
app.get('/api/analytics', (_req, res) => {
  const tasks = queryAll('SELECT * FROM tasks').map(rowToTask);
  const history = queryAll(
    `SELECT * FROM task_history WHERE action IN ('created','updated','deleted','migrated') ORDER BY timestamp ASC`
  );

  // Status distribution
  const statusDist = {};
  for (const s of VALID_STATUSES) statusDist[s] = 0;
  tasks.forEach(t => { statusDist[t.status] = (statusDist[t.status] || 0) + 1; });

  // Priority distribution
  const priorityDist = {};
  for (const p of VALID_PRIORITIES) priorityDist[p] = 0;
  tasks.forEach(t => { priorityDist[t.priority] = (priorityDist[t.priority] || 0) + 1; });

  // Type distribution
  const typeDist = {};
  for (const tp of VALID_TYPES) typeDist[tp] = 0;
  tasks.forEach(t => { typeDist[t.type] = (typeDist[t.type] || 0) + 1; });

  // Weekly velocity: count tasks that moved to done/publish per week
  const doneHistory = history.filter(h =>
    h.action === 'updated' && h.field === 'status' && (h.newValue === 'done' || h.newValue === 'publish')
  );
  const weeklyVelocity = {};
  doneHistory.forEach(h => {
    const d = new Date(h.timestamp);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weeklyVelocity[key] = (weeklyVelocity[key] || 0) + 1;
  });

  // Cycle time: average days from created to done/publish
  const cycleTimes = [];
  tasks.filter(t => t.status === 'done' || t.status === 'publish').forEach(t => {
    const created = new Date(t.createdAt);
    const moved = new Date(t.updatedAt);
    const days = (moved - created) / (1000 * 60 * 60 * 24);
    if (days >= 0) cycleTimes.push(days);
  });
  const avgCycleTime = cycleTimes.length > 0
    ? (cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length).toFixed(1)
    : 0;

  // Burndown: cumulative tasks created vs completed over time
  const burndown = {};
  history.forEach(h => {
    const day = h.timestamp.slice(0, 10);
    if (!burndown[day]) burndown[day] = { created: 0, completed: 0 };
    if (h.action === 'created' || h.action === 'migrated') burndown[day].created++;
    if (h.action === 'updated' && h.field === 'status' && (h.newValue === 'done' || h.newValue === 'publish')) {
      burndown[day].completed++;
    }
  });

  res.json({
    totalTasks: tasks.length,
    statusDist,
    priorityDist,
    typeDist,
    weeklyVelocity,
    avgCycleTime: parseFloat(avgCycleTime),
    cycleTimes,
    burndown,
  });
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const validationErrors = validateTask(req.body, true);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors.join('; ') });
  }

  const now = new Date().toISOString();
  const task = {
    id: req.body.id || uuidv4(),
    title: req.body.title || '',
    desc: req.body.desc || '',
    tags: JSON.stringify(req.body.tags || []),
    priority: req.body.priority || 'P3',
    type: req.body.type || 'feature',
    status: req.body.status || 'backlog',
    dependency: req.body.dependency || '',
    releaseTime: req.body.releaseTime || '',
    risk: req.body.risk ? 1 : 0,
    marker: req.body.marker || '',
    subtasks: JSON.stringify(req.body.subtasks || []),
    recurrence: req.body.recurrence ? JSON.stringify(req.body.recurrence) : '',
    createdAt: now,
    updatedAt: now,
    lastMoved: now.slice(0, 10),
  };

  run(`INSERT INTO tasks (id, title, desc, tags, priority, type, status, dependency, releaseTime, risk, marker, subtasks, recurrence, createdAt, updatedAt, lastMoved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [task.id, task.title, task.desc, task.tags, task.priority, task.type,
     task.status, task.dependency, task.releaseTime, task.risk, task.marker,
     task.subtasks, task.recurrence, task.createdAt, task.updatedAt, task.lastMoved]);
  saveDB();

  const result = rowToTask({ ...task, tags: task.tags });
  result.tags = req.body.tags || [];
  result.subtasks = req.body.subtasks || [];
  result.recurrence = req.body.recurrence || null;
  recordHistory(task.id, 'created', null, result);
  res.status(201).json(result);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const validationErrors = validateTask(req.body, false);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors.join('; ') });
  }

  const rows = queryAll('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });

  const old = rows[0];
  const now = new Date().toISOString();
  const statusChanged = req.body.status && req.body.status !== old.status;

  // Track changes for history
  const changes = [];
  const fields = ['title', 'desc', 'priority', 'type', 'status', 'dependency', 'releaseTime', 'marker'];
  for (const f of fields) {
    if (req.body[f] !== undefined && String(req.body[f]) !== String(old[f])) {
      changes.push({ field: f, oldValue: old[f], newValue: req.body[f] });
    }
  }
  if (req.body.tags !== undefined) {
    const oldTags = old.tags || '[]';
    const newTags = JSON.stringify(req.body.tags);
    if (oldTags !== newTags) {
      changes.push({ field: 'tags', oldValue: oldTags, newValue: newTags });
    }
  }
  if (req.body.risk !== undefined && (req.body.risk ? 1 : 0) !== old.risk) {
    changes.push({ field: 'risk', oldValue: old.risk, newValue: req.body.risk ? 1 : 0 });
  }
  if (req.body.subtasks !== undefined) {
    const oldSub = old.subtasks || '[]';
    const newSub = JSON.stringify(req.body.subtasks);
    if (oldSub !== newSub) {
      changes.push({ field: 'subtasks', oldValue: oldSub, newValue: newSub });
    }
  }

  // Build update
  const updated = {
    title: req.body.title !== undefined ? req.body.title : old.title,
    desc: req.body.desc !== undefined ? req.body.desc : old.desc,
    tags: req.body.tags !== undefined ? JSON.stringify(req.body.tags) : old.tags,
    priority: req.body.priority || old.priority,
    type: req.body.type || old.type,
    status: req.body.status || old.status,
    dependency: req.body.dependency !== undefined ? req.body.dependency : old.dependency,
    releaseTime: req.body.releaseTime !== undefined ? req.body.releaseTime : old.releaseTime,
    risk: req.body.risk !== undefined ? (req.body.risk ? 1 : 0) : old.risk,
    marker: req.body.marker !== undefined ? req.body.marker : (old.marker || ''),
    subtasks: req.body.subtasks !== undefined ? JSON.stringify(req.body.subtasks) : (old.subtasks || '[]'),
    recurrence: req.body.recurrence !== undefined ? JSON.stringify(req.body.recurrence) : (old.recurrence || ''),
    updatedAt: now,
    lastMoved: statusChanged ? now.slice(0, 10) : old.lastMoved,
  };

  run(`UPDATE tasks SET title=?, desc=?, tags=?, priority=?, type=?, status=?,
       dependency=?, releaseTime=?, risk=?, marker=?, subtasks=?, recurrence=?,
       updatedAt=?, lastMoved=?
       WHERE id=?`,
    [updated.title, updated.desc, updated.tags, updated.priority, updated.type,
     updated.status, updated.dependency, updated.releaseTime, updated.risk,
     updated.marker, updated.subtasks, updated.recurrence,
     updated.updatedAt, updated.lastMoved, req.params.id]);
  saveDB();

  if (changes.length > 0) {
    recordHistory(req.params.id, 'updated', changes, null);
  }

  const result = rowToTask({ ...old, ...updated, id: req.params.id, createdAt: old.createdAt });
  res.json(result);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const rows = queryAll('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });

  const task = rowToTask(rows[0]);
  recordHistory(req.params.id, 'deleted', null, task);

  run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  saveDB();
  res.json({ ok: true });
});

// POST clone task (for recurrence)
app.post('/api/tasks/:id/clone', (req, res) => {
  const rows = queryAll('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });

  const src = rowToTask(rows[0]);
  const now = new Date().toISOString();
  const newId = uuidv4();
  const clone = {
    id: newId,
    title: src.title,
    desc: src.desc,
    tags: JSON.stringify(src.tags),
    priority: src.priority,
    type: src.type,
    status: 'todo',
    dependency: src.dependency,
    releaseTime: '',
    risk: 0,
    marker: '',
    subtasks: JSON.stringify(src.subtasks.map(s => ({ ...s, done: false }))),
    recurrence: src.recurrence ? JSON.stringify(src.recurrence) : '',
    createdAt: now,
    updatedAt: now,
    lastMoved: now.slice(0, 10),
  };

  run(`INSERT INTO tasks (id, title, desc, tags, priority, type, status, dependency, releaseTime, risk, marker, subtasks, recurrence, createdAt, updatedAt, lastMoved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [clone.id, clone.title, clone.desc, clone.tags, clone.priority, clone.type,
     clone.status, clone.dependency, clone.releaseTime, clone.risk, clone.marker,
     clone.subtasks, clone.recurrence, clone.createdAt, clone.updatedAt, clone.lastMoved]);
  saveDB();

  const result = rowToTask(clone);
  recordHistory(newId, 'created', null, { ...result, clonedFrom: req.params.id });
  res.status(201).json(result);
});

// POST import tasks (bulk)
app.post('/api/import', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array of tasks' });
  if (items.length > 500) return res.status(400).json({ error: 'Max 500 tasks per import' });

  let imported = 0;
  const now = new Date().toISOString();

  for (const item of items) {
    const errs = validateTask(item, true);
    if (errs.length > 0) continue; // skip invalid

    const id = item.id || uuidv4();
    const existing = queryAll('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existing.length > 0) continue; // skip duplicates

    run(`INSERT INTO tasks (id, title, desc, tags, priority, type, status, dependency, releaseTime, risk, marker, subtasks, recurrence, createdAt, updatedAt, lastMoved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, item.title || '', item.desc || '',
       JSON.stringify(item.tags || []),
       item.priority || 'P3', item.type || 'feature', item.status || 'backlog',
       item.dependency || '', item.releaseTime || '',
       item.risk ? 1 : 0, item.marker || '',
       JSON.stringify(item.subtasks || []),
       item.recurrence ? JSON.stringify(item.recurrence) : '',
       item.createdAt || now, item.updatedAt || now,
       item.lastMoved || now.slice(0, 10)]);

    recordHistory(id, 'created', null, item);
    imported++;
  }

  saveDB();
  res.json({ imported, total: items.length });
});

// GET export (all tasks as JSON)
app.get('/api/export', (_req, res) => {
  const rows = queryAll('SELECT * FROM tasks ORDER BY updatedAt DESC');
  const tasks = rows.map(rowToTask);
  res.setHeader('Content-Disposition', 'attachment; filename="solohelm-export.json"');
  res.json(tasks);
});

/* ---------- Start ---------- */
async function start() {
  const SQL = await initSqlJs();

  // Load existing DB or create new
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
    console.log('Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('Created new database');
  }

  initSchema();
  migrateFromJSON();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
