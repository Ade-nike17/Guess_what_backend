require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const User = require('./models/User');
const GameSession = require('./models/GameSession');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://guess-what-frontend-blond.vercel.app',
  'https://maxed-straw.pipeops.net',
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
}));

// Socket.io CORS config matches same origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

let activeSessions = {}; // Memory store for game sessions

// API to create session
app.post('/api/session', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const user = await User.create({ username, sessionCode });
  const session = await GameSession.create({
    sessionCode,
    masterId: user._id,
    players: [user._id]
  });
  return res.json({ sessionCode, master: user, session });
});

// Socket.io Events
io.on('connection', (socket) => {
    console.log(`🟢 ${socket.id} connected`);
    
    // Join a session
    socket.on('join-session', async ({ username, sessionCode }) => {
        const session = await GameSession.findOne({ sessionCode });
        if (!session) return socket.emit('error', 'Invalid session code');
        if (session.isActive) return socket.emit('error', 'Game in progress');

        const user = await User.create({ username, sessionCode });
        session.players.push(user._id);
        await session.save();

        socket.join(sessionCode);
        socket.data = { userId: user._id, sessionCode };

        io.to(sessionCode).emit('player-list', await User.find({ sessionCode }).select('username -_id').lean());
    });

    // Game master starts game
    socket.on('start-game', async ({ sessionCode, question, answer }) => {
        const session = await GameSession.findOne({ sessionCode });
        if (!session) return;

        if (session.players.length < 2)
        return io.to(sessionCode).emit('error', 'Need at least 2 players');

        session.question = question;
        session.answer = answer;
        session.isActive = true;
        session.startTime = new Date();
        await session.save();

        // initialize runtime session
        activeSessions[sessionCode] = {
        question,
        answer,
        attempts: {},
        timer: null,
        timeLeft: 60
        };

        // start 60s countdown
        const interval = setInterval(async () => {
            const current = activeSessions[sessionCode];
            if (!current) return clearInterval(interval);

            current.timeLeft -= 1;
            io.to(sessionCode).emit('timer', current.timeLeft);

            if (current.timeLeft <= 0) {
                clearInterval(interval);
                io.to(sessionCode).emit('game-ended', {
                    winner: null,
                    answer,
                    message: "Time's up! No one guessed correctly."
                });
                session.isActive = false;
                await session.save();
                delete activeSessions[sessionCode];
            }
        }, 1000);

        activeSessions[sessionCode].timer = interval;
        io.to(sessionCode).emit('game-started', { question });
    });

    // Player makes a guess
    socket.on('guess', async ({ guess }) => {
        const { sessionCode, userId } = socket.data;
        const runtime = activeSessions[sessionCode];
        if (!runtime) return socket.emit('message', 'No active game.');

        runtime.attempts[userId] = (runtime.attempts[userId] || 0) + 1;
        if (runtime.attempts[userId] > 3)
            return socket.emit('message', 'No more attempts left!');

        const session = await GameSession.findOne({ sessionCode });

        if (guess.toLowerCase() === runtime.answer.toLowerCase()) {
        clearInterval(runtime.timer);
        const winner = await User.findById(userId);
        winner.score += 10;
        await winner.save();

        io.to(sessionCode).emit('game-ended', {
            winner: winner.username,
            answer: runtime.answer,
            message: `${winner.username} guessed correctly!`,
            scores: await User.find({ sessionCode })
        });

        session.isActive = false;
        session.winnerId = userId;
        await session.save();
        delete activeSessions[sessionCode];
    } else {
        const remaining = 3 - runtime.attempts[userId];
        socket.emit('message', 'Wrong answer, try again!');
        }
    });

    socket.on('disconnect', async () => {
        console.log(`🔴 ${socket.id} disconnected`);
    });
});

app.get('/', (req, res) => {
  res.send('Guessing Game Backend is running!');
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});