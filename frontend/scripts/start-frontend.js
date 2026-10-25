/**
 * NETPULSE - Vite Frontend Server Launcher
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertPortFree } from './port-utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FRONTEND_DIR = path.resolve(__dirname, '..')

// 1. Check Port 5173 Conflict
const portAvailable = await assertPortFree(5173, 'Vite Frontend Server')
if (!portAvailable) {
  process.exit(1)
}

console.log('\x1b[36;1m[NETPULSE WEB]\x1b[0m Launching Vite frontend on \x1b[36mhttp://localhost:5173\x1b[0m')

// 2. Spawn Vite Process
const isWin = process.platform === 'win32'
const viteCmd = isWin ? 'npx.cmd vite' : 'npx vite'

const child = spawn(viteCmd, {
  cwd: FRONTEND_DIR,
  stdio: 'inherit',
  env: process.env,
  shell: true
})

// 3. Graceful Termination Cleanup
function cleanup() {
  if (child && !child.killed) {
    if (isWin && child.pid) {
      try {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' })
      } catch {
        child.kill('SIGTERM')
      }
    } else {
      child.kill('SIGTERM')
    }
  }
}

process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})

process.on('SIGTERM', () => {
  cleanup()
  process.exit(0)
})

process.on('exit', cleanup)

child.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[NETPULSE WEB]\x1b[0m Frontend process exited with code ${code}`)
  }
  process.exit(code || 0)
})
