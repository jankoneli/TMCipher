const express = require("express");
const app = express();
const {createServer} = require("node:http")
const {Server} = require("socket.io")
const server = createServer(app);
const io = new Server(server);

var userscolor = {}
var usersname = {}



app.use("/src/", express.static("src"))
app.use("/crypto/", express.static("node_modules/crypto-js"))
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})
app.get("/c/:id", (req, res) => {
    res.sendFile(__dirname+"/channel.html")
})
function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}
io.on("connection", (socket) => {
    console.log("user connected");
    socket.on("joinme", (channelid, userdisplay) => {
        if(!userscolor.hasOwnProperty(socket.id)){
            var colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#ffffff", "#999999", "#e87d0d"]
            userscolor[socket.id] = colors[Object.keys(userscolor).length]
            console.log(userscolor, Object.keys(userscolor).length    )
        }
        if(!Object.values(usersname).includes(userdisplay)){
            socket.join(channelid)
            usersname[socket.id] = userdisplay
        }else{
            socket.emit("abort")
        }
    })
    socket.on("msgchannel", (msg, room, hash, salt) => {
        io.to(room).emit("message", usersname[socket.id], msg, hash, userscolor[socket.id], salt, socket.id)
    })
})
io.on("disconnect", (socket) => {
    usersname[socket.id] = null
})

server.listen(3030);