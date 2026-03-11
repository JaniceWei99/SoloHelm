const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readTasks() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('read error', e);
    return [];
  }
}

function writeTasks(tasks) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function notFound(res) {
  json(res, 404, { message: 'Not Found' });
}

function badRequest(res, message) {
  json(res, 400, { message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.split('/').filter(Boolean);

  if (url.pathname === '/health') return json(res, 200, { ok: true });

  if (segments[0] !== 'api' || segments[1] !== 'tasks') {
    return notFound(res);
  }

  const id = segments[2];

  if (req.method === 'GET' && !id) {
    const tasks = readTasks();
    return json(res, 200, tasks);
  }

  if (req.method === 'POST' && !id) {
    try {
      const body = await parseBody(req);
      if (!body.title) return badRequest(res, 'title required');
      const now = new Date().toISOString();
      const tasks = readTasks();
      const newTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: body.title,
        desc: body.desc || '',
        tags: body.tags ? body.tags.map(t => t.trim()).filter(Boolean) : [],
        priority: body.priority || 'P2',
        type: body.type || 'idea',
        status: body.status || 'backlog',
        dependency: body.dependency?.trim() || '',
        dueDate: body.dueDate?.trim() || '',
        releaseTime: body.releaseTime?.trim() || '',
        mark: body.mark || '',
        risk: !!body.risk,
        createdAt: now,
        updatedAt: now,
        lastMoved: ['done', 'publish'].includes(body.status) ? now.slice(0, 10) : '',
      };
      tasks.unshift(newTask);
      writeTasks(tasks);
      return json(res, 201, newTask);
    } catch (e) {
      console.error('post error', e);
      return badRequest(res, 'invalid json');
    }
  }

  if (id && req.method === 'PATCH') {
    try {
      const body = await parseBody(req);
      const tasks = readTasks();
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return notFound(res);
      const updated = {
        ...tasks[idx],
        ...body,
        tags: body.tags ? body.tags.map(t => t.trim()).filter(Boolean) : tasks[idx].tags,
        dependency: body.dependency !== undefined ? body.dependency.trim() : tasks[idx].dependency,
        dueDate: body.dueDate !== undefined ? body.dueDate.trim() : tasks[idx].dueDate,
        releaseTime: body.releaseTime !== undefined ? body.releaseTime.trim() : tasks[idx].releaseTime,
        mark: body.mark !== undefined ? body.mark : tasks[idx].mark,
        risk: body.risk !== undefined ? !!body.risk : tasks[idx].risk,
        updatedAt: new Date().toISOString(),
      };
      tasks[idx] = updated;
      writeTasks(tasks);
      return json(res, 200, updated);
    } catch (e) {
      console.error('patch error', e);
      return badRequest(res, 'invalid json');
    }
  }

  if (id && req.method === 'DELETE') {
    const tasks = readTasks();
    const next = tasks.filter(t => t.id !== id);
    if (next.length === tasks.length) return notFound(res);
    writeTasks(next);
    return json(res, 200, { ok: true });
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
