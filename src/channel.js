var passphrase = localStorage.getItem("passphrase")
var aborted = false
var key = ""
var salt = ""
var anotherKeys = {}
// if password is not defined, then kick the user
if (passphrase == null){
    aborted = true
    alert("Session has been terminated. Please rejoin. ");
    open("/", "_self");
}else{
    passphrase = passphrase.toString();
    salt = CryptoJS.lib.WordArray.random(256 / 8).toString();
    key = CryptoJS.PBKDF2(passphrase, salt.toString(), {keySize: 512 / 32, iterations:100000}).toString()
}
localStorage.removeItem("passphrase");
const socket = io();

socket.on('abort', () => {
    aborted = true
    alert("Display name already exists.")
    open("/", "_self")
});

// receiving message
socket.on("message", (user, msg, hash, colorChat, anotherSalt, socketid) => {
    var plaintext = ""
    if (anotherSalt != salt){
        if (!Object.keys(anotherKeys).includes(socketid)){
            var anotherkey = CryptoJS.PBKDF2(passphrase, anotherSalt.toString(), {keySize: 512 / 32, iterations:100000}).toString()
            anotherKeys[socketid] = anotherkey
        }
        plaintext = CryptoJS.AES.decrypt(msg, anotherKeys[socketid]).toString(CryptoJS.enc.Utf8)
    }else{
        plaintext = CryptoJS.AES.decrypt(msg, key).toString(CryptoJS.enc.Utf8)
    }
    if(CryptoJS.SHA256(plaintext).toString() == hash){
        document.querySelector(".messages").innerHTML = '<p><span style="color: clr;margin-right: 2px;">user (socketid):</span>text</p>'.replace("clr", colorChat).replace("socketid", socketid).replace("text", plaintext.replaceAll("<", "[REDACTED]").replaceAll(">", "[REDACTED]")).toString(CryptoJS.enc.Utf8).replace("user", CryptoJS.AES.decrypt(user, passphrase).toString(CryptoJS.enc.Utf8).replaceAll("<", "[REDACTED]").replaceAll(">", "[REDACTED]")) + document.querySelector(".messages").innerHTML
    }
})
if(!aborted){
    socket.emit("joinme", localStorage.getItem("channelid"), CryptoJS.AES.encrypt(prompt("Enter Display Name: "), passphrase).toString());
    $(".channelid").text(localStorage.getItem("channelid"))
}
// Send message to server then back to channel
$(".msg").keypress((e) => {
    if(e.which == 13){
        if (!$(".msg").val() == ""){
            var hash = CryptoJS.SHA256($(".msg").val()).toString()
            var ciphertext = CryptoJS.AES.encrypt($(".msg").val(), key).toString()
            socket.emit("msgchannel", ciphertext, localStorage.getItem("channelid"), hash, salt.toString())
            $(".msg").val("")
            return false;
        }
        
    }
})