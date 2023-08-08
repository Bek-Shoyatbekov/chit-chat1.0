const http = require("http");
const express = require("express");
const io = require("socket.io")();
const dotenv = require('dotenv');
const SocketIOService = require("./src/services/socketio");
const path = require("path");
const app = express();
const connectDB = require("./src/utils/connectDb");

dotenv.config();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());



// Setting up server
const server = http.createServer(app);



server.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running... ${process.env.PORT}`);
});

const socketIOService = new SocketIOService(io);


// attaching socketio
io.attach(server);





