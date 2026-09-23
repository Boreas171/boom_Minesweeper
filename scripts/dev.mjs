import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const viteEntry = resolve('node_modules/vite/bin/vite.js')
const children = [
  spawn(process.execPath, ['server.mjs'], { stdio: 'inherit' }),
  spawn(process.execPath, [viteEntry, ...process.argv.slice(2)], { stdio: 'inherit' }),
]

function stopChildren() {
  children.forEach((child) => child.kill())
}

process.on('SIGINT', stopChildren)
process.on('SIGTERM', stopChildren)

children.forEach((child) => {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stopChildren()
      process.exitCode = code
    }
  })
})
