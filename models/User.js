const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    score: { type: Number, default: 0 },
    sessionCode: { type: String },
});

module.exports = mongoose.model('User', userSchema);