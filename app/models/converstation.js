const mongoose = require('mongoose');

const chats = mongoose.Schema({
    conversationId: { conv_Id : mongoose.Schema.ObjectId },
    author     : String,
    to         : String,
    body       : String,
    date       : Date
});

module.exports = mongoose.model('chats', chats);