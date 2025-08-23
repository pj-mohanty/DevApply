// tests/applications.test.js
const request = require('supertest');
const express = require('express');
const applicationsRoutes = require('../routes/applications');

//mock console.error before any tests run
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

jest.mock('../firebase', () => {
  // Mock document reference with all required methods
  const mockDocRef = {
    id: 'mock-id',
    get: jest.fn().mockResolvedValue({
      exists: true,
      id: 'mock-id',
      data: () => ({
        jobTitle: 'Software Engineer',
        company: 'Acme Inc',
        status: 'Applied',
        dateApplied: '2023-07-01',
        applicationLink: 'https://acme.jobs/apply',
        jobDescription: 'Job desc here',
        resume: 'Resume content',
        uid: 'test-user-id'
      }),
    }),
    update: jest.fn().mockResolvedValue(),
    delete: jest.fn().mockResolvedValue(),
  };

  // Mock collection with add, doc, get
  const mockCollection = {
    where: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue(mockDocRef),
    doc: jest.fn(() => mockDocRef),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: 'mock-id',
          data: () => ({
            jobTitle: 'Software Engineer',
            company: 'Acme Inc',
            status: 'Applied',
            dateApplied: '2023-07-01',
            applicationLink: 'https://acme.jobs/apply',
            jobDescription: 'Job desc here',
            resume: 'Resume content',
            uid: 'test-user-id'
          }),
        },
      ],
    }),
  };

  return {
    collection: jest.fn(() => mockCollection),
  };
});

const app = express();
app.use(express.json());
app.use('/api', applicationsRoutes);

describe('Application API', () => {
  const validApplication = {
    jobTitle: 'Software Engineer',
    company: 'Acme Inc',
    status: 'Applied',
    dateApplied: '2023-07-01',
    applicationLink: 'https://acme.jobs/apply',
    jobDescription: 'Job desc here',
    resume: 'Resume content',
    uid: 'test-user-id'
  };

  test('POST /api/applications - success', async () => {
    const res = await request(app).post('/api/applications').send(validApplication);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 'mock-id');
    expect(res.body).toHaveProperty('jobTitle', 'Software Engineer');
    expect(res.body).toHaveProperty('uid', 'test-user-id');
  });

  test('POST /api/applications - missing fields returns 400', async () => {
    const res = await request(app).post('/api/applications').send({ company: 'Acme Inc' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing fields');
  });

  test('GET /api/applications?uid=test-user-id - filters applications by uid', async () => {
  const res = await request(app).get('/api/applications?uid=test-user-id');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty('uid', 'test-user-id');
  });

  test('GET /api/applications - returns list', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id', 'mock-id');
  });

  test('GET /api/applications/:id - existing application', async () => {
    const res = await request(app).get('/api/applications/mock-id');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'mock-id');
    expect(res.body).toHaveProperty('jobTitle', 'Software Engineer');
  });

  test('GET /api/applications/:id - non-existing application returns 404', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue({ exists: false }),
      update: jest.fn(),
      delete: jest.fn(),
    });

    const res = await request(app).get('/api/applications/nonexistent-id');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Application not found');
  });

  test('GET /api/applications/:id/jobDescription - returns jobDescription', async () => {
    const res = await request(app).get('/api/applications/mock-id/jobDescription');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('jobDescription', 'Job desc here');
  });

  test('GET /api/applications/:id/jobDescription - not found returns 404', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    const res = await request(app).get('/api/applications/nonexistent-id/jobDescription');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Application not found');
  });

  test('PUT /api/applications/:id - update success', async () => {
    const updatedData = { ...validApplication, status: 'Interview' };
    const res = await request(app).put('/api/applications/mock-id').send(updatedData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'mock-id');
    expect(res.body).toHaveProperty('status', 'Applied'); // mocked data does not change actual value
  });

  test('PUT /api/applications/:id - update failure returns 500', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection().doc.mockReturnValueOnce({
      update: jest.fn().mockRejectedValue(new Error('Update error')),
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: 'mock-id',
        data: () => validApplication,
      }),
    });

    const res = await request(app).put('/api/applications/mock-id').send(validApplication);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to update application');
  });

  test('DELETE /api/applications/:id - delete success', async () => {
    const res = await request(app).delete('/api/applications/mock-id');
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /api/applications/:id - delete failure returns 500', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection().doc.mockReturnValueOnce({
      delete: jest.fn().mockRejectedValue(new Error('Delete error')),
    });

    const res = await request(app).delete('/api/applications/mock-id');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to delete application');
  });
});