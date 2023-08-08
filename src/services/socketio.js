const User = require("../models/user.model");
const Message = require("../models/message.model");
const Room = require("../models/room.model");
const moment = require("moment");

const admin = "Admin";


module.exports = class SocketIOService {
    constructor(io) {
        this.io = io;
        this.connnectionHandler();
    }

    connnectionHandler() {
        this.io.on('connection', socket => {
            try {
                socket.on("joinRoom", async ({ username, room }) => {

                    // When user joins the room
                    const user = await this.joinRoom(socket.id, username, room);
                    socket.join(user.room);
                    socket.emit("message", this.formatMessage(admin, `Welcome to ${user.room}`));

                    // Broadcast when a user connects
                    socket.broadcast
                        .to(user.room)
                        .emit(
                            "message",
                            this.formatMessage(admin, `${user.username} has joined the chat`)
                        );

                    // Send users and room info
                    this.io.to(user.room).emit("roomUsers", {
                        room: user.room,
                        users: await this.getRoomUsers(user.room),
                    });
                });


                // Listen to chatMessage
                socket.on("chatMessage", async (msg) => {
                    const user = await this.getUser(socket.id);
                    const formattedMessage = this.formatMessage(user.username, msg);
                    this.io.to(user.room).emit("message", formattedMessage);
                });

                // When client disconnects
                socket.on("disconnect", () => {
                    const user = this.leaveRoom(socket.id);
                    if (user) {
                        this.io.to(user.room).emit(
                            "message",
                            this.formatMessage(admin, `${user.username} has left the chat`)
                        );
                        // Send users and room info
                        this.io.to(user.room).emit("roomUsers", {
                            room: user.room,
                            users: this.getRoomUsers(user.room),
                        });
                    }
                });
            } catch (err) {
                console.error(err);
                this.handlerErrors(err);
            }
        });
    }


    async joinRoom(id, username, room) {
        try {
            const user = { id, username, room };
            const newUser = await User.create(user);

            const roomExists = await Room.findOne({ title: room });
            if (roomExists) {
                roomExists.users.push(newUser);
                await roomExists.save();
            } else {
                const newRoom = await Room.create({
                    title: room
                });
                newRoom.users.push(newUser);
                await newRoom.save();
            }

            await newUser.save();
            return user;
        } catch (err) {
            this.handlerErrors(err);
        }
    }

    async getUser(id) {
        try {
            const user = await User.findOne({ id: id });
            if (!user) {
                this.handlerErrors(new Error("User not Found"))
            }
            return user;
        } catch (err) {
            this.handlerErrors(err);
        }
    }

    async leaveRoom(id) {
        try {
            const leaveUser = await User.deleteOne({ id });
            const users = await User.find();
            return users;
        } catch (err) {
            this.handlerErrors(err);
        }
    }


    async getRoomUsers(room) {
        try {
            const roomWithMemebers = await Room.findOne({ title: room }).select("-__v -_id").populate("users");
            if (roomWithMemebers) {
                return roomWithMemebers.users;
            }
            return [];
        } catch (err) {
            this.handlerErrors(err);
        }
    }


    formatMessage(username, text) {
        return {
            username,
            text,
            time: moment().format('h:mm a')
        };
    }


    handlerErrors(err) {
        console.error(err);
    }

}


