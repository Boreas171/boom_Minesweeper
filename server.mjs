import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const port = Number(process.env.PORT ?? 3001)
const rootDirectory = process.cwd()
const dataDirectory = join(rootDirectory, 'data')
const leaderboardPath = join(dataDirectory, 'leaderboard.json')
const distDirectory = join(rootDirectory, 'dist')
const maxRequestBodySize = 16 * 1024

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

function formatUtc8Time(date = new Date()) {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second} UTC+8`
}

async function readLeaderboard() {
  try {
    const content = await readFile(leaderboardPath, 'utf8')
    const entries = JSON.parse(content)
    return Array.isArray(entries) ? entries : []
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

async function writeLeaderboard(entries) {
  await mkdir(dataDirectory, { recursive: true })
  await writeFile(leaderboardPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
}

function sortByElapsedTime(entries) {
  return [...entries].sort((first, second) => first.elapsedSeconds - second.elapsedSeconds)
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = ''

    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > maxRequestBodySize) {
        rejectBody(new Error('请求内容过大'))
        request.destroy()
      }
    })
    request.on('end', () => resolveBody(body))
    request.on('error', rejectBody)
  })
}

function isLeaderboardRequest(payload) {
  return (
    payload &&
    typeof payload === 'object' &&
    Number.isInteger(payload.elapsedSeconds) &&
    payload.elapsedSeconds >= 0 &&
    ['easy', 'normal', 'hard'].includes(payload.difficulty)
  )
}

async function serveStaticFile(requestPath, response) {
  const requestedPath = requestPath === '/' ? '/index.html' : requestPath
  const normalizedPath = normalize(requestedPath).replace(/^([\\/])+/, '')
  const filePath = resolve(distDirectory, normalizedPath)

  if (!filePath.startsWith(resolve(distDirectory))) {
    sendJson(response, 403, { message: '禁止访问该文件。' })
    return
  }

  try {
    const content = await readFile(filePath)
    const contentType = mimeTypes[extname(filePath)] ?? 'application/octet-stream'
    response.writeHead(200, { 'Content-Type': contentType })
    response.end(content)
  } catch {
    const index = await readFile(join(distDirectory, 'index.html'))
    response.writeHead(200, { 'Content-Type': mimeTypes['.html'] })
    response.end(index)
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  try {
    if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
      sendJson(response, 200, sortByElapsedTime(await readLeaderboard()))
      return
    }

    if (url.pathname === '/api/leaderboard' && request.method === 'POST') {
      const payload = JSON.parse(await readRequestBody(request))
      if (!isLeaderboardRequest(payload)) {
        sendJson(response, 400, { message: '排行榜数据无效。' })
        return
      }

      const entry = {
        id: crypto.randomUUID(),
        elapsedSeconds: payload.elapsedSeconds,
        difficulty: payload.difficulty,
        completedAt: formatUtc8Time(),
      }
      const entries = sortByElapsedTime([...(await readLeaderboard()), entry])
      await writeLeaderboard(entries)
      sendJson(response, 201, entry)
      return
    }

    if (!existsSync(distDirectory)) {
      sendJson(response, 503, { message: '尚未构建前端文件，请先执行 npm run build。' })
      return
    }

    await serveStaticFile(url.pathname, response)
  } catch (error) {
    console.error(error)
    sendJson(response, 500, { message: '服务器处理请求时发生错误。' })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`排行榜与生产服务已启动：http://127.0.0.1:${port}`)
})
