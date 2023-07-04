const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mysql = require('mysql')
var cookieParser = require('cookie-parser');
var session = require('express-session')

app.use(cookieParser());
app.use(session({
    secret: '34SDgsdgspxxxxxxxdfsG', // just a long random string
    resave: false,
    saveUninitialized: true
}));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chat"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected mysql!");
});


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg, sessionID) => {
        io.emit('message received', true); // This will emit the event to all connected sockets
        io.emit('print message', msg) //Nuovo evento
        insertInto({ username: "Fabrizio", text: msg, sessionID: sessionID });
    });

    socket.on('request chat', (sessionID) => {
        var sql = `SELECT * FROM conversation WHERE id_session = ?`;
        var sessionID = sessionID; //Necessario?
        //TODO:: bind params...
        con.query(sql, [sessionID], function (err, result) {
            if (err) throw err;
            // console.log("result:::",result);
            io.emit("print messages", result);
        });
    })
});

app.get('/', (req, res) => {
    console.log("SESSION::", req.sessionID);
    if (!req.query.sessionID) {
        res.redirect('http://localhost:3000?sessionID=' + req.sessionID);
    }
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});



function insertInto({ username, text, sessionID }) {
    var sql = `INSERT INTO conversation (username, message, id_session) VALUES ('${username}', '${text}', '${sessionID}')`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
}