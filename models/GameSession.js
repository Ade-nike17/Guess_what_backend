const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    sessionCode: { type: String, required: true },
    masterId: String,
    players: [String],
    question: String,
    answer: String,
    isActive: { type: Boolean, default: false },
    winnerId: String,
    startTime: Date,
});

module.exports = mongoose.model('GameSession', gameSessionSchema);