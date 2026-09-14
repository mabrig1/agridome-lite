import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { ADMIN_EMAIL, hashPassword } from '../src/lib/server/admin-auth'

async function main() {
  const port = 3107
  const origin = `http://127.0.0.1:${port}`
  const password = randomBytes(24).toString('base64url')
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    env: { ...process.env, NODE_ENV: 'production', ADMIN_PASSWORD_HASH: await hashPassword(password), ADMIN_SESSION_SECRET: randomBytes(48).toString('base64url') },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let logs = ''
  server.stdout?.on('data', chunk => { logs += chunk.toString() })
  server.stderr?.on('data', chunk => { logs += chunk.toString() })
  try {
    let ready = false
    for (let i = 0; i < 60; i++) {
      if (server.exitCode !== null) throw new Error(`Test server failed: ${logs}`)
      try { const response = await fetch(`${origin}/api/admin/session`); if (response.status === 401) { ready = true; break } } catch {}
      await delay(500)
    }
    assert.ok(ready, 'Production test server started')
    const title = 'Run your first AgriDome session'
    for (const path of ['/admin', '/admin?q=soil']) {
      const response = await fetch(origin + path, { redirect: 'manual' })
      assert.equal(response.status, 307)
      assert.equal(response.headers.get('location'), '/admin/login')
      assert.match(response.headers.get('cache-control')!, /no-store/)
      assert.ok(!(await response.text()).includes(title))
    }
    const forged = await fetch(`${origin}/admin`, { headers: { cookie: 'agridome_admin_session=forged.admin' }, redirect: 'manual' })
    assert.equal(forged.status, 307)
    const rsc = await fetch(`${origin}/admin?_rsc=test`, { headers: { RSC: '1' }, redirect: 'manual' })
    assert.ok(!(await rsc.text()).includes(title), 'Unauthenticated RSC must not contain articles')
    const login = await fetch(`${origin}/api/admin/session`, { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: ADMIN_EMAIL, password }) })
    assert.equal(login.status, 200)
    const setCookie = login.headers.get('set-cookie')!
    assert.match(setCookie, /Secure/i)
    assert.match(setCookie, /HttpOnly/i)
    const cookie = setCookie.split(';')[0]
    const admin = await fetch(`${origin}/admin`, { headers: { cookie } })
    assert.equal(admin.status, 200)
    assert.match(admin.headers.get('cache-control')!, /no-store/)
    const html = await admin.text()
    assert.ok(html.includes(title))
    assert.ok(html.includes('victoryonline1@gmail.com'))
    assert.ok(html.includes('Use the Soil Health and Treatment Assistant'))
    const search = await fetch(`${origin}/admin?q=zzzz-no-guide-matches`, { headers: { cookie } })
    const searchHtml = await search.text()
    assert.ok(searchHtml.includes('No matching guides.'))
    assert.ok(!searchHtml.includes(title))
    const filtered = await fetch(`${origin}/admin?category=Greenhouse%20and%20soil`, { headers: { cookie } })
    const filteredHtml = await filtered.text()
    assert.ok(filteredHtml.includes('Use the Zero-Cash Build Assistant'))
    assert.ok(!filteredHtml.includes(title))
    const publicResponse = await fetch(origin)
    assert.ok(!(await publicResponse.text()).includes(title), 'Public dashboard must not contain administrator articles')
    const logout = await fetch(`${origin}/api/admin/session`, { method: 'DELETE', headers: { origin, cookie } })
    assert.equal(logout.status, 200)
    assert.match(logout.headers.get('set-cookie')!, /Max-Age=0/i)
    const afterLogout = await fetch(`${origin}/admin`, { headers: { cookie: logout.headers.get('set-cookie')!.split(';')[0] }, redirect: 'manual' })
    assert.equal(afterLogout.status, 307)
    console.log('PASS: production HTTP checks for protected HTML/RSC, forged cookie rejection, login, secure cookies, search, category filtering, public content isolation and logout.')
  } finally { server.kill('SIGTERM') }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
