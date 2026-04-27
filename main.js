const mineflayer = require('mineflayer')

let bot = null
let loops = []

function random(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function stopLoops(){
loops.forEach(x=>clearInterval(x))
loops=[]
}

function startBot(config,statusCallback){

if(bot) return

bot = mineflayer.createBot({
host: config.host,
port: Number(config.port),
username: config.username,
version: config.version,
auth: 'offline',
checkTimeoutInterval: 60000
})

bot.once('spawn', ()=>{

statusCallback("Bot Online")

antiAfk()
packetLoop()
commandLoop()

})

bot.on('end', ()=>{
statusCallback("Bağlantı Kesildi")
stopLoops()
bot=null
})

bot.on('kicked', ()=>{
statusCallback("Kicklendi")
})

bot.on('error', ()=>{
statusCallback("Hata Oluştu")
})

function antiAfk(){

loops.push(setInterval(()=>{

if(!bot) return

const r = random(1,6)

if(r===1){
bot.setControlState('jump',true)
setTimeout(()=>bot?.setControlState('jump',false),500)
}

if(r===2){
bot.setControlState('sneak',true)
setTimeout(()=>bot?.setControlState('sneak',false),1500)
}

if(r===3){
bot.look(Math.random()*Math.PI*2,0,true)
}

if(r===4){
bot.setControlState('forward',true)
setTimeout(()=>bot?.setControlState('forward',false),2000)
}

if(r===5){
bot.swingArm()
}

if(r===6){
bot.setControlState('left',true)
setTimeout(()=>bot?.setControlState('left',false),1200)
}

}, random(7000,15000)))

}

function packetLoop(){

loops.push(setInterval(()=>{

if(!bot) return

bot.look(
bot.entity.yaw + (Math.random()-0.5),
bot.entity.pitch,
true
)

},4000))

}

function commandLoop(){

const cmds = ['/help','/spawn','/menu','/warp']

loops.push(setInterval(()=>{

if(!bot) return

bot.chat(cmds[random(0,cmds.length-1)])

},180000))

}

}

function stopBot(){

if(bot){
bot.quit()
bot=null
}

stopLoops()

}

module.exports = { startBot, stopBot }
