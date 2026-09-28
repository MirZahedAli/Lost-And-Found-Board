const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('health, create item, list API and reject invalid input', async () => {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;

  // 1. Health check
  const health = await (await fetch(`${base}/health`)).json();
  assert.equal(health.status, 'ok');
  assert.ok(typeof health.commit === 'string');

  // 2. Create a valid lost item
  const post = await fetch(`${base}/items`, {
    method: 'POST',
    body: new URLSearchParams({
      title: 'Black umbrella',
      description: 'Left near library entrance',
      type: 'lost',
      contact: 'student@mitwpu.edu.in',
    }),
    redirect: 'manual',
  });
  assert.equal(post.status, 302);

  // 3. API returns the new item
  const list = await (await fetch(`${base}/api/items`)).json();
  assert.ok(Array.isArray(list));
  assert.ok(list.length >= 1);
  const last = list[list.length - 1];
  assert.equal(last.title, 'Black umbrella');
  assert.equal(last.type, 'lost');

  // 4. Invalid input is rejected (missing type)
  const bad = await fetch(`${base}/items`, {
    method: 'POST',
    body: new URLSearchParams({
      title: 'Something',
      description: 'No type',
      contact: 'x@y.com',
    }),
  });
  assert.equal(bad.status, 400);

  // 5. Another invalid case – empty title
  const bad2 = await fetch(`${base}/items`, {
    method: 'POST',
    body: new URLSearchParams({
      title: '',
      description: 'Empty title',
      type: 'found',
      contact: 'a@b.com',
    }),
  });
  assert.equal(bad2.status, 400);

  server.close();
});
