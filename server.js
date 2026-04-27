const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const manager = require('./main')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PASSWORD = process.env.BOT_PASSWORD || "shadow123"
const MAX_LOGS = 80  // panelde kaç log tutulsun

let logs = []
let botRunning = false

app.use(express.json())
app.use(express.static('public'))

function addLog(msg) {
  const line = `[${new Date().toLocaleTimeString('tr-TR')}] ${msg}`
  logs.push(line)
  if (logs.length > MAX_LOGS) logs.shift()
  io.emit('log', line)
  io.emit('status', botRunning ? 'online' : 'offline')
}

app.post('/start', (req, res) => {
  if (req.body.password !== PASSWORD)
    return res.json({ ok: false, msg: 'Şifre yanlış' })

  if (botRunning)
    return res.json({ ok: false, msg: 'Bot zaten çalışıyor' })

  botRunning = true
  manager.startBot(req.body, addLog)
  res.json({ ok: true })
})

app.post('/stop', (req, res) => {
  if (req.body.password !== PASSWORD)
    return res.json({ ok: false, msg: 'Şifre yanlış' })

  botRunning = false
  manager.stopBot(addLog)
  res.json({ ok: true })
})

app.get('/logs', (req, res) => {
  res.json(logs)
})

io.on('connection', (socket) => {
  socket.emit('status', botRunning ? 'online' : 'offline')
  socket.emit('history', logs)
})

server.listen(process.env.PORT || 3000, () => {
  console.log('Panel açık: http://localhost:3000')
})
