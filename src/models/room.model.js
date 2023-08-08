const mongoose = require("mongoose");


const roomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });


module.exports = mongoose.model("Room", roomSchema);