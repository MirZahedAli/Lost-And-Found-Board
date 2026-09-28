const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In-memory store (resets on restart – fine for this assignment)
const items = [];

// Escape user input so HTML/script tags are shown as text (XSS protection)
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Commit ID shown in footer (Render sets RENDER_GIT_COMMIT automatically)
const sha = process.env.GIT_SHA || process.env.RENDER_GIT_COMMIT || 'local';
const commit = sha.slice(0, 7);

app.get('/', (req, res) => {
  const lost = items.filter((i) => i.type === 'lost');
  const found = items.filter((i) => i.type === 'found');

  const renderList = (list) =>
    list
      .map(
        (i) =>
          `<li class="item">
            <strong>${esc(i.title)}</strong>
            <span class="badge ${i.type}">${esc(i.type)}</span>
            <p>${esc(i.description)}</p>
            <small>Contact: ${esc(i.contact)} · Reported ${esc(i.createdAt)}</small>
          </li>`
      )
      .join('') || '<li class="empty">No items yet.</li>';

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Campus Lost & Found</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --lost: #f87171;
      --found: #4ade80;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem 1rem;
      line-height: 1.5;
    }
    .container { max-width: 720px; margin: 0 auto; }
    header {
      text-align: center;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 1.9rem;
      background: linear-gradient(90deg, #38bdf8, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.35rem;
    }
    header p { color: var(--muted); font-size: 0.95rem; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    h2 { font-size: 1.15rem; margin-bottom: 1rem; color: var(--accent); }
    form { display: grid; gap: 0.75rem; }
    label { font-size: 0.85rem; color: var(--muted); }
    input, select, textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #0f172a;
      color: var(--text);
      font-size: 0.95rem;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(56,189,248,0.25);
    }
    button {
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      color: #0f172a;
      border: none;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 0.25rem;
    }
    button:hover { opacity: 0.9; }
    ul { list-style: none; }
    .item {
      padding: 1rem 0;
      border-bottom: 1px solid var(--border);
    }
    .item:last-child { border-bottom: none; }
    .badge {
      display: inline-block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      margin-left: 0.5rem;
      font-weight: 600;
    }
    .badge.lost { background: rgba(248,113,113,0.2); color: var(--lost); }
    .badge.found { background: rgba(74,222,128,0.2); color: var(--found); }
    .item p { margin: 0.4rem 0; color: var(--text); }
    .item small { color: var(--muted); font-size: 0.8rem; }
    .empty { color: var(--muted); padding: 0.5rem 0; }
    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .stat {
      flex: 1;
      min-width: 120px;
      background: #0f172a;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      text-align: center;
      border: 1px solid var(--border);
    }
    .stat strong { display: block; font-size: 1.5rem; color: var(--accent); }
    .stat span { font-size: 0.8rem; color: var(--muted); }
    footer {
      text-align: center;
      margin-top: 2rem;
      color: var(--muted);
      font-size: 0.8rem;
    }
    footer code {
      background: #1e293b;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Campus Lost &amp; Found</h1>
      <p>Report lost or found items · Server-rendered dynamic board</p>
    </header>

    <div class="card">
      <div class="stats">
        <div class="stat">
          <strong>${items.length}</strong>
          <span>Total reports</span>
        </div>
        <div class="stat">
          <strong>${lost.length}</strong>
          <span>Lost</span>
        </div>
        <div class="stat">
          <strong>${found.length}</strong>
          <span>Found</span>
        </div>
      </div>

      <h2>Report an item</h2>
      <form method="POST" action="/items">
        <div>
          <label for="title">Title *</label>
          <input id="title" name="title" placeholder="e.g. Blue backpack" required maxlength="80">
        </div>
        <div>
          <label for="description">Description *</label>
          <textarea id="description" name="description" rows="2" placeholder="Where / when / any identifying marks" required maxlength="300"></textarea>
        </div>
        <div>
          <label for="type">Type *</label>
          <select id="type" name="type" required>
            <option value="">Select…</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>
        <div>
          <label for="contact">Contact (email or phone) *</label>
          <input id="contact" name="contact" placeholder="you@college.edu or 98xxxxxxx" required maxlength="60">
        </div>
        <button type="submit">Submit report</button>
      </form>
    </div>

    <div class="card">
      <h2>Lost items (${lost.length})</h2>
      <ul>${renderList(lost)}</ul>
    </div>

    <div class="card">
      <h2>Found items (${found.length})</h2>
      <ul>${renderList(found)}</ul>
    </div>

    <footer>
      Campus Lost &amp; Found · commit <code>${commit}</code>
    </footer>
  </div>
</body>
</html>`);
});

app.post('/items', (req, res) => {
  const title = (req.body.title || '').trim();
  const description = (req.body.description || '').trim();
  const type = (req.body.type || '').trim().toLowerCase();
  const contact = (req.body.contact || '').trim();

  if (!title || !description || !contact || !['lost', 'found'].includes(type)) {
    return res
      .status(400)
      .send('Title, description, contact and a valid type (lost/found) are required.');
  }

  items.push({
    id: items.length + 1,
    title,
    description,
    type,
    contact,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  });

  res.redirect('/');
});

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', commit });
});

module.exports = app;
