/**
 * NETPULSE - Python FastAPI Backend Launcher
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import { spawn, spawnSync, execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { assertPortFree } from './port-utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BACKEND_DIR = path.resolve(__dirname, '../../backend')
const WORKSPACE_DIR = path.resolve(__dirname, '../../')

// 1. Check Port 8000 Conflict
const portAvailable = await assertPortFree(8000, 'FastAPI Backend')
if (!portAvailable) {
  process.exit(1)
}

// 2. Discover Python Executable
function findPython() {
  const localAppData = process.env.LOCALAPPDATA || ''
  const candidates = [
    process.env.PYTHON_PATH,
    path.join(WORKSPACE_DIR, '.venv', 'Scripts', 'python.exe'),
    path.join(BACKEND_DIR, '.venv', 'Scripts', 'python.exe'),
    path.join(WORKSPACE_DIR, 'venv', 'Scripts', 'python.exe'),
    path.join(BACKEND_DIR, 'venv', 'Scripts', 'python.exe'),
    path.join(localAppData, 'Programs', 'Python', 'Python312', 'python.exe'),
    path.join(localAppData, 'Programs', 'Python', 'Python311', 'python.exe'),
    'python',
    'python3',
    'py'
  ].filter(Boolean)

  let fallbackCandidate = null

  // Pass 1: Try to find a candidate that already has all backend dependencies installed
  for (const candidate of candidates) {
    try {
      const vRes = spawnSync(candidate, ['--version'], { encoding: 'utf-8', windowsHide: true })
      if (vRes.status === 0) {
        if (!fallbackCandidate) fallbackCandidate = candidate
        const depRes = spawnSync(
          candidate,
          ['-c', 'import fastapi, uvicorn, numpy, pandas, scipy, pydantic, dotenv'],
          { cwd: BACKEND_DIR, encoding: 'utf-8', windowsHide: true }
        )
        if (depRes.status === 0) {
          return candidate
        }
      }
    } catch {
      // Continue searching
    }
  }

  // Pass 2: Return first working Python executable if none had dependencies
  return fallbackCandidate
}

const pythonExe = findPython()
if (!pythonExe) {
  console.error('\n\x1b[31;1m[NETPULSE ERROR]\x1b[0m Python 3.11+ executable not found in PATH or virtual environments.')
  console.error('Please ensure Python is installed and accessible.')
  console.error('Actionable steps:')
  console.error('  1. Install Python 3.11 or 3.12 from https://python.org')
  console.error('  2. Ensure "Add Python to PATH" is checked during installation')
  console.error('  3. Or set the PYTHON_PATH environment variable:')
  console.error('     \x1b[90m$env:PYTHON_PATH = "C:\\Path\\To\\Python\\python.exe"\x1b[0m\n')
  process.exit(1)
}

// 3. Verify Backend Dependencies
const depCheck = spawnSync(
  pythonExe,
  ['-c', 'import fastapi, uvicorn, numpy, pandas, scipy, pydantic, dotenv'],
  { cwd: BACKEND_DIR, encoding: 'utf-8', windowsHide: true }
)

if (depCheck.status !== 0) {
  console.error('\n\x1b[31;1m[NETPULSE ERROR]\x1b[0m Missing required backend Python packages.')
  console.error('Verification details:', depCheck.stderr?.trim() || depCheck.stdout?.trim())
  console.error('\x1b[36mActionable setup command:\x1b[0m')
  console.error('  cd "../backend"')
  console.error('  pip install -r requirements.txt\n')
  process.exit(1)
}

// 4. Check Environment Configuration
const backendEnvPath = path.join(BACKEND_DIR, '.env')
const uvicornArgs = ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000']
if (fs.existsSync(backendEnvPath)) {
  uvicornArgs.push('--env-file', '.env')
} else {
  console.log('\x1b[33m[NETPULSE NOTICE]\x1b[0m backend/.env not found. Backend will start with offline defaults.')
  console.log('\x1b[90mTip: Copy backend/.env.example to backend/.env to connect hosted Supabase.\x1b[0m\n')
}

console.log(`\x1b[35;1m[NETPULSE API]\x1b[0m Launching FastAPI backend on \x1b[36mhttp://127.0.0.1:8000\x1b[0m (CWD: ${BACKEND_DIR})`)

// 5. Spawn Uvicorn Backend Process
const child = spawn(pythonExe, uvicornArgs, {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  env: process.env,
  windowsHide: false
})

// 6. Graceful Termination Cleanup
function cleanup() {
  if (child && !child.killed) {
    if (process.platform === 'win32' && child.pid) {
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
    console.error(`\x1b[31m[NETPULSE API]\x1b[0m Backend process exited with code ${code}`)
  }
  process.exit(code || 0)
})
