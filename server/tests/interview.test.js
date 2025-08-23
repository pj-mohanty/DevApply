const request = require('supertest');
const express = require('express');
const interviewRoutes = require('../routes/interview');

// mock firebase.js to avoid real Firestore calls
jest.mock('../firebase', () => {
  const mockDoc = {
    get: jest.fn().mockResolvedValue({ exists: false }),
    update: jest.fn().mockResolvedValue(),
    delete: jest.fn().mockResolvedValue(),
  };

  const mockCollection = {
    doc: jest.fn(() => mockDoc),
    add: jest.fn().mockResolvedValue({ id: 'mock-id' })
  };

  return {
    collection: () => mockCollection
  };
});

const app = express();
app.use(express.json());
app.use('/api', interviewRoutes);

describe('Interview Entry API', () => {
  test('POST /api/interview-entry - missing required fields', async () => {
    const res = await request(app).post('/api/interview-entry').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  test('POST /api/interview-entry - missing question and response', async () => {
    const res = await request(app)
      .post('/api/interview-entry')
      .send({ uid: 'test-user-123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  test('POST /api/interview-entry - valid data should succeed', async () => {
    const res = await request(app).post('/api/interview-entry').send({
      uid: 'test-user-123',
      question: 'What is React?',
      response: 'React is a JavaScript library for building UIs.'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Interview entry saved!');
    expect(res.body).toHaveProperty('id');
  });

  test('GET /api/interview-entry/:id - entry not found', async () => {
    const res = await request(app).get('/api/interview-entry/test-id');
    expect(res.statusCode).toBe(404);
  });

  test('PATCH /api/interview-entry/:id - entry not found', async () => {
    const res = await request(app)
      .patch('/api/interview-entry/test-id')
      .send({ question: 'Updated Q' });
    expect(res.statusCode).toBe(404);
  });

  test('PATCH /api/interview-entry/:id - missing update data', async () => {
    const res = await request(app)
      .patch('/api/interview-entry/test-id')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /api/interview-entry/:id - entry not found', async () => {
    const res = await request(app).delete('/api/interview-entry/test-id');
    expect(res.statusCode).toBe(404);
  });
});