const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const manager = require('./main')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PASSWORD = "shadow123"
let status = "Kapalı"

app.use(express.json())
app.use(express.static('public'))

function setStatus(t){
status=t
io.emit('status',status)
}

app.post('/start',(req,res)=>{

if(req.body.password !== PASSWORD)
return res.json({ok:false})

manager.startBot(req.body,setStatus)

res.json({ok:true})

})

app.post('/stop',(req,res)=>{

if(req.body.password !== PASSWORD)
return res.json({ok:false})

manager.stopBot()
setStatus("Durduruldu")

res.json({ok:true})

})

io.on('connection',(socket)=>{
socket.emit('status',status)
})

server.listen(process.env.PORT || 3000)
