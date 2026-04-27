/**
 * MCAFKBot PRO - 1.21.8 Uyumlu Anti-AFK Bot
 * Amaç:
 * - Sunucunun oyuncu var sanıp kapanmaması
 * - Sürekli paket akışı olması
 * - Rastgele insan gibi hareketler
 * - Eğilme / zıplama / dönme / bakma
 * - Slash komut denemeleri (chatte görünür ama komut olarak gider)
 * - Yeniden bağlanma
 *
 * Kurulum:
 * npm install mineflayer
 *
 * Çalıştır:
 * node bot.js
 */

const mineflayer = require('mineflayer')

function createBot() {

const bot = mineflayer.createBot({
    host: 'DeaDtest.aternos.me',   // sunucu ip
    port: 25565,
    username: 'LysBotAFK',
    version: '1.21.8',
    auth: 'offline',
    checkTimeoutInterval: 60 * 1000
})

bot.once('spawn', () => {
    console.log('Bot giriş yaptı.')

    antiAfkLoop()
    packetLoop()
    commandLoop()
})

bot.on('kicked', console.log)
bot.on('error', console.log)

bot.on('end', () => {
    console.log('Bağlantı kesildi. 10 sn sonra tekrar bağlanıyor...')
    setTimeout(createBot, 10000)
})

/* ------------------------- */
/* ANA ANTI AFK HAREKETLERİ */
/* ------------------------- */

function antiAfkLoop() {

    setInterval(() => {

        const random = Math.floor(Math.random() * 8)

        switch(random) {

            case 0:
                jump()
                break

            case 1:
                sneak()
                break

            case 2:
                smallWalk()
                break

            case 3:
                rotate()
                break

            case 4:
                lookRandom()
                break

            case 5:
                punchAir()
                break

            case 6:
                strafe()
                break

            case 7:
                randomCombo()
                break
        }

    }, randomBetween(7000, 15000))
}

/* ------------------------- */
/* SÜREKLİ PAKET TRAFİĞİ     */
/* ------------------------- */

function packetLoop() {

    setInterval(() => {

        try {
            bot.look(
                bot.entity.yaw + (Math.random() - 0.5),
                bot.entity.pitch + (Math.random() - 0.5),
                true
            )
        } catch {}

    }, 4000)
}

/* ------------------------- */
/* CHAT KOMUT DENEMELERİ    */
/* ------------------------- */

function commandLoop() {

    const cmds = [
        '/help',
        '/spawn',
        '/menu',
        '/warp',
        '/hub',
        '/rtp'
    ]

    setInterval(() => {

        const cmd = cmds[Math.floor(Math.random() * cmds.length)]

        try {
            bot.chat(cmd)
        } catch {}

    }, 180000) // 3 dk
}

/* ------------------------- */
/* HAREKET FONKSİYONLARI    */
/* ------------------------- */

function jump() {
    bot.setControlState('jump', true)

    setTimeout(() => {
        bot.setControlState('jump', false)
    }, 800)
}

function sneak() {
    bot.setControlState('sneak', true)

    setTimeout(() => {
        bot.setControlState('sneak', false)
    }, 2500)
}

function smallWalk() {

    const dirs = ['forward', 'back', 'left', 'right']
    const dir = dirs[Math.floor(Math.random() * dirs.length)]

    bot.setControlState(dir, true)

    setTimeout(() => {
        bot.setControlState(dir, false)
    }, randomBetween(1000, 3500))
}

function strafe() {

    bot.setControlState('left', true)

    setTimeout(() => {
        bot.setControlState('left', false)
        bot.setControlState('right', true)

        setTimeout(() => {
            bot.setControlState('right', false)
        }, 1200)

    }, 1200)
}

function rotate() {
    bot.look(
        bot.entity.yaw + Math.PI,
        0,
        true
    )
}

function lookRandom() {
    bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5),
        true
    )
}

function punchAir() {
    try {
        bot.swingArm('right')
    } catch {}
}

function randomCombo() {
    jump()
    setTimeout(() => sneak(), 900)
    setTimeout(() => lookRandom(), 1800)
}

/* ------------------------- */

function randomBetween(min,max){
    return Math.floor(Math.random()*(max-min+1))+min
}

}

createBot()
