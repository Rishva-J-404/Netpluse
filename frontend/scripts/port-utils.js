/**
 * NETPULSE - Port Availability Checker Utility
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import net from 'node:net'

/**
 * Checks if a specific TCP port is available on localhost.
 * Resolves to true if available, false if in use.
 */
export function isPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        resolve(false)
      } else {
        resolve(true)
      }
    })
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, host)
  })
}

/**
 * Validates that a required port is free before starting a service.
 * Prints clear diagnostics and recovery instructions if blocked.
 */
export async function assertPortFree(port, serviceName) {
  const free = await isPortAvailable(port)
  if (!free) {
    console.error(`\n\x1b[31;1m[NETPULSE CONFLICT]\x1b[0m Port \x1b[33m${port}\x1b[0m is already in use by another process!`)
    console.error(`The \x1b[1m${serviceName}\x1b[0m cannot bind to http://127.0.0.1:${port}.\n`)
    console.error('\x1b[36mTroubleshooting & Recovery Instructions:\x1b[0m')
    console.error(`  1. Check which process is occupying port ${port}:`)
    console.error(`     \x1b[90mGet-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess\x1b[0m`)
    console.error(`  2. Stop the conflicting process or previously opened server.`)
    console.error(`  3. Re-run: \x1b[32mnpm run dev\x1b[0m\n`)
    return false
  }
  return true
}
