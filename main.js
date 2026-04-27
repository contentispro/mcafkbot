const mineflayer = require('mineflayer')

let bot = null
let loops = []
let reconnecting = false
let reconnectCount = 0
let startTime = null
let lastAction = -1  // aynı hareketi üst üste yapma

const MAX_RECONNECT_DELAY = 30000  // max 30sn bekle
const BASE_RECONNECT_DELAY = 4000

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getReconnectDelay() {
  // her denemede biraz artar, max 30sn
  const delay = Math.min(BASE_RECONNECT_DELAY + reconnectCount * 2000, MAX_RECONNECT_DELAY)
  return delay + random(0, 3000)  // +random jitter
}

function stopLoops() {
  loops.forEach(x => clearInterval(x))
  loops = []
}

function cleanup() {
  stopLoops()
  startTime = null
  if (bot) {
    try { bot.removeAllListeners() } catch (_) {}
    try { bot._client?.end() } catch (_) {}
    bot = null
  }
}

function getUptime() {
  if (!startTime) return '—'
  const sec = Math.floor((Date.now() - startTime) / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}dk ${s}sn`
}

function scheduleReconnect(config, log) {
  if (reconnecting) return
  reconnecting = true
  reconnectCount++

  const delay = getReconnectDelay()
  log(`⚠️ Yeniden bağlanıyor... #${reconnectCount} (${Math.round(delay / 1000)}sn)`)

  setTimeout(() => {
    reconnecting = false
    startBot(config, log)
  }, delay)
}

function startBot(config, log) {
  if (bot) return

  log('🔌 Bağlantı kuruluyor...')

  bot = mineflayer.createBot({
    host: config.host,
    port: Number(config.port),
    username: config.username,
    version: config.version,
    auth: 'offline',
    checkTimeoutInterval: 60000,
    hideErrors: false
  })

  bot.once('spawn', () => {
    reconnectCount = 0  // başarılı bağlantıda sayacı sıfırla
    startTime = Date.now()
    log(`✅ Online | ${config.username}@${config.host}`)

    antiAfk(log)
    packetLoop()
    commandLoop(log)
    uptimeReporter(log)
  })

  bot.on('kicked', (reason) => {
    let clean = reason
    try { clean = JSON.parse(reason)?.text || reason } catch (_) {}
    log(`🚫 Kicked: ${clean} | Uptime: ${getUptime()}`)
    cleanup()
    scheduleReconnect(config, log)
  })

  bot.on('end', (reason) => {
    if (reconnecting) return
    log(`🔴 Bağlantı kesildi: ${reason || 'bilinmiyor'} | Uptime: ${getUptime()}`)
    cleanup()
    scheduleReconnect(config, log)
  })

  bot.on('error', (err) => {
    log(`❌ Hata: ${err.message}`)
    // end event'i zaten gelecek
  })

  // --- AFK HAREKETLER ---

  function antiAfk(log) {
    const actions = [
      () => {
        bot.setControlState('jump', true)
        setTimeout(() => bot?.setControlState('jump', false), 500)
      },
      () => {
        bot.setControlState('sneak', true)
        setTimeout(() => bot?.setControlState('sneak', false), 1500)
      },
      () => {
        bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.5, true)
      },
      () => {
        bot.setControlState('forward', true)
        setTimeout(() => bot?.setControlState('forward', false), random(800, 2000))
      },
      () => {
        bot.swingArm()
      },
      () => {
        bot.setControlState('left', true)
        setTimeout(() => bot?.setControlState('left', false), random(600, 1500))
      },
      () => {
        bot.setControlState('right', true)
        setTimeout(() => bot?.setControlState('right', false), random(600, 1500))
      },
      () => {
        bot.setControlState('back', true)
        setTimeout(() => bot?.setControlState('back', false), random(500, 1000))
      }
    ]

    loops.push(setInterval(() => {
      if (!bot?.entity) return

      // aynı hareketi üst üste yapma
      let r
      do { r = random(0, actions.length - 1) } while (r === lastAction)
      lastAction = r

      try { actions[r]() } catch (_) {}

    }, random(8000, 18000)))
  }

  function packetLoop() {
    loops.push(setInterval(() => {
      if (!bot?.entity) return
      try {
        bot.look(
          bot.entity.yaw + (Math.random() - 0.5) * 0.3,
          bot.entity.pitch + (Math.random() - 0.5) * 0.1,
          true
        )
      } catch (_) {}
    }, random(3000, 6000)))
  }

  function commandLoop(log) {
    const cmds = ['/help', '/spawn', '/menu', '/warp', '/list']
    loops.push(setInterval(() => {
      if (!bot) return
      const cmd = cmds[random(0, cmds.length - 1)]
      try {
        bot.chat(cmd)
        log(`💬 Komut gönderildi: ${cmd}`)
      } catch (_) {}
    }, random(160000, 200000)))  // 2.5-3.5dk random
  }

  function uptimeReporter(log) {
    loops.push(setInterval(() => {
      if (!bot) return
      log(`📊 Uptime: ${getUptime()} | Reconnect: ${reconnectCount}x`)
    }, 300000))  // 5dk'da bir rapor
  }
}

function stopBot(log) {
  reconnecting = true  // otomatik reconnect'i engelle
  if (log) log(`⏹️ Bot durduruldu | Son uptime: ${getUptime()}`)
  cleanup()
  reconnecting = false
  reconnectCount = 0
}

module.exports = { startBot, stopBot, getUptime }
