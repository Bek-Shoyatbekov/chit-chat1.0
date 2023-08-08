// import mongoose
const mongoose = require('mongoose');

require("dotenv").config();

module.exports = async function conn() {
    try {
        // connect to MongoDB
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // connection object
        const db = mongoose.connection;

        // handle connection events
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            console.log('Connected to MongoDB');
        });
    } catch (err) {
        console.error(err);
    }
}