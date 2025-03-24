const express = require("express");
const app = express();
const {createServer} = require("node:http")
const {Server} = require("socket.io")
const server = createServer(app);
const io = new Server(server);

var userscolor = {}
var usersname = {}

app.use("/src/", express.static("src"))
app.use("/bower_components/", express.static("bower_components"))
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})
app.get("/channel/:id", (req, res) => {
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
            userscolor[socket.id] = choose(["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#ffffff", "#999999"])
        }
        if(!Object.values(usersname).includes(userdisplay)){
            socket.join(channelid)
            usersname[socket.id] = userdisplay
        }else{
            socket.emit("abort")
        }
    })
    socket.on("msgchannel", (msg, room, hash, salt) => {
        io.to(room).emit("message", usersname[socket.id], msg, hash, userscolor[socket.id], salt)
    })
})

server.listen(3030);

var AES = require("crypto-js/aes");
var test = AES.encrypt("skibidi", "dop dop dop yes yes").toString()
console.log(test)