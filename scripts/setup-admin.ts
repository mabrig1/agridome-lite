import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { ADMIN_EMAIL, hashPassword } from '../src/lib/server/admin-auth'

async function main() {
  const path = '.env.local'
  const current = existsSync(path) ? readFileSync(path, 'utf8') : ''
  if (/^ADMIN_(PASSWORD_HASH|SESSION_SECRET)=/m.test(current) && !process.argv.includes('--rotate')) {
    throw new Error('Administrator credentials already exist. Use npm run admin:setup -- --rotate to reset them and revoke existing sessions.')
  }
  const password = randomBytes(24).toString('base64url')
  const hash = await hashPassword(password)
  const secret = randomBytes(48).toString('base64url')
  const retained = current.split('\n').filter(line => !/^ADMIN_(PASSWORD_HASH|SESSION_SECRET)=/.test(line)).join('\n').trimEnd()
  writeFileSync(path, `${retained}\n\nADMIN_PASSWORD_HASH=${hash}\nADMIN_SESSION_SECRET=${secret}\n`, { mode: 0o600 })
  console.log(`Administrator: ${ADMIN_EMAIL}\nPassword (save in your password manager): ${password}\n\nServer secrets saved in .env.local. Add ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET to the intended Vercel environment before deploying. Never add a NEXT_PUBLIC_ prefix or commit this file.`)
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
