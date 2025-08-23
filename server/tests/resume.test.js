const request = require('supertest');
const express = require('express');
const resumeRoutes = require('../routes/resume');

// mock firebase.js to avoid real Firestore calls
jest.mock('../firebase', () => {
  const mockCollection = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({ exists: false }),
      update: jest.fn().mockResolvedValue(),
      delete: jest.fn().mockResolvedValue(),
    })),
    add: jest.fn().mockResolvedValue({ id: 'mocked-id' }),
  };

  return {
    collection: () => mockCollection,
    FieldValue: {
      serverTimestamp: jest.fn()
    }
  };
});

const app = express();
app.use(express.json());
app.use('/api', resumeRoutes);

describe('Resume API', () => {
  test('POST /api/resume - missing uid or tag should return 400', async () => {
    const res = await request(app)
      .post('/api/resume')
      .send({ fullName: 'Test User' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing uid or tag/);
  });

  test('GET /api/resume/:uid/:tag - resume not found', async () => {
    const res = await request(app).get('/api/resume/testUid/testTag');
    expect(res.statusCode).toBe(404);
  });

  test('GET /api/resume-by-id/:id - nonexistent ID should return 404', async () => {
    const res = await request(app).get('/api/resume-by-id/nonexistentid');
    expect(res.statusCode).toBe(404);
  });

  test('GET /api/resume/:uid - return empty list', async () => {
    const res = await request(app).get('/api/resume/testUid');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]); // mocked empty docs
  });

  test('PATCH /api/resume/:id - should succeed with mocked update', async () => {
    const res = await request(app)
      .patch('/api/resume/testId')
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/resume/:id - should succeed with mocked delete', async () => {
    const res = await request(app).delete('/api/resume/testId');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/resume-latest/:uid - no resume found', async () => {
    const res = await request(app).get('/api/resume-latest/testUid');
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/resume-by-tag/:uid/:tag - no resume found', async () => {
    const res = await request(app).delete('/api/resume-by-tag/testUid/testTag');
    expect(res.statusCode).toBe(404);
  });
});

describe('Resume API - Additional Routes', () => {
  beforeAll(() => {
    // Override the get mock to simulate a found resume with projects, experience, skills
    const mockDocs = [
      {
        data: () => ({
          projects: ['Project 1', 'Project 2'],
          experience: ['Experience 1', 'Experience 2'],
          skills: 'JavaScript, Node.js',
        }),
      },
    ];
    // Override the mock function inside the collection().where() chain
    const mockCollection = require('../firebase').collection();
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: mockDocs,
    });
  });

  test('GET /api/resume-projects/:uid/:tag - should return projects array', async () => {
    const res = await request(app).get('/api/resume-projects/testUid/testTag');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('projects');
    expect(Array.isArray(res.body.projects)).toBe(true);
  });

  test('GET /api/resume-experience/:uid/:tag - should return experience array', async () => {
    const res = await request(app).get('/api/resume-experience/testUid/testTag');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('experience');
    expect(Array.isArray(res.body.experience)).toBe(true);
  });

  test('GET /api/resume-skills/:uid/:tag - should return skills string', async () => {
    const res = await request(app).get('/api/resume-skills/testUid/testTag');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('skills');
    expect(typeof res.body.skills).toBe('string');
  });
});