const mongoose = require("mongoose");


const messageSchema = new mongoose.Schema({
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String
    }
}, { timestamps: true });


module.exports = mongoose.model("Message", messageSchema);