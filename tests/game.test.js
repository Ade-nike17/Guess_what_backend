const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

let server;

beforeAll(() => {
    server = require('http').createServer();
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe('Guessing Game API', () => {
    it('should create a new game session', async () => {
        const res = await request('http:localhost:5173')
            .post('api/session')
            .send({ username: 'Master' });
        expect(res.statusCode).toBe(200);
        expect(res.body.sessionCode).toBeDefined();
    });
});