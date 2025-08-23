const request = require('supertest');
const express = require('express');
const profileRoutes = require('../routes/profile');

jest.mock('../firebase', () => {
  // Mock Firestore collection and doc
  const mockDoc = {
    id: 'mock-profile-id',
    data: () => ({
      uid: 'test-user-id',
      name: 'Test User',
      location: 'Test City',
      skills: ['JS', 'React'],
      education: 'Test University',
      experience: '2 years',
      bio: 'Test bio',
      linkedinId: 'test-linkedin',
      leetcodeId: 'test-leetcode',
      githubId: 'test-github',
      portfolioId: 'test-portfolio',
    }),
    get: jest.fn().mockResolvedValue({
      id: 'mock-profile-id',
      data: () => ({
        uid: 'test-user-id',
        name: 'Test User',
        location: 'Test City',
        skills: ['JS', 'React'],
        education: 'Test University',
        experience: '2 years',
        bio: 'Test bio',
        linkedinId: 'test-linkedin',
        leetcodeId: 'test-leetcode',
        githubId: 'test-github',
        portfolioId: 'test-portfolio',
      }),
    }),
    set: jest.fn().mockResolvedValue(),
  };
  const mockCollection = {
    limit: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [mockDoc],
      }),
    })),
    where: jest.fn().mockReturnValue({
      limit: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [mockDoc],
        }),
      })),
    }),
    add: jest.fn().mockResolvedValue({
      id: 'mock-profile-id',
      get: jest.fn().mockResolvedValue({
        id: 'mock-profile-id',
        data: () => ({
          uid: 'test-user-id',
          name: 'Test User',
          location: 'Test City',
          skills: ['JS', 'React'],
          education: 'Test University',
          experience: '2 years',
          bio: 'Test bio',
          linkedinId: 'test-linkedin',
          leetcodeId: 'test-leetcode',
          githubId: 'test-github',
          portfolioId: 'test-portfolio',
        }),
      }),
    }),
    doc: jest.fn(() => mockDoc),
  };
  return {
    collection: jest.fn(() => mockCollection),
  };
});

const app = express();
app.use(express.json());
app.use('/api', profileRoutes);

describe('Profile API', () => {
  test('GET /api/profile - returns profile', async () => {
    const res = await request(app).get('/api/profile?uid=test-user-id');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'mock-profile-id');
    expect(res.body).toHaveProperty('name', 'Test User');
  });

  test('GET /api/profile - no profile found', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection.mockReturnValueOnce({
      where: jest.fn().mockReturnValue({
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
        })),
      }),
    });
    const res = await request(app).get('/api/profile?uid=test-user-id');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'No profile found for this user');
  });

  test('PUT /api/profile - creates new profile if none exists', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection.mockReturnValueOnce({
      where: jest.fn().mockReturnValue({
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
        })),
      }),
      add: jest.fn().mockResolvedValue({
        id: 'mock-profile-id',
        get: jest.fn().mockResolvedValue({
          id: 'mock-profile-id',
          data: () => ({ uid: 'test-user-id', name: 'Test User' }),
        }),
      }),
    });
    const res = await request(app).put('/api/profile').send({ uid: 'test-user-id', name: 'Test User' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'mock-profile-id');
    expect(res.body).toHaveProperty('name', 'Test User');
  });

  test('PUT /api/profile - updates existing profile', async () => {
    const res = await request(app).put('/api/profile').send({ uid: 'test-user-id', name: 'Updated User' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'mock-profile-id');
  });

  test('GET /api/profile - server error', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection.mockImplementationOnce(() => { throw new Error('Firestore error'); });
    const res = await request(app).get('/api/profile?uid=test-user-id');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Firestore error');
  });
}); 