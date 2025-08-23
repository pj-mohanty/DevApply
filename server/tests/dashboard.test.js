const request = require('supertest');
const express = require('express');
const dashboardRoutes = require('../routes/dashboard');

jest.mock('../firebase', () => {
  // Mock Firestore collections
  const mockApplications = [
    { id: 'app1', data: () => ({ status: 'Applied', company: 'Company A', createdAt: new Date(), dateApplied: '2023-07-01', uid: 'user1' }) },
    { id: 'app2', data: () => ({ status: 'Interview Scheduled', company: 'Company B', createdAt: new Date(), dateApplied: '2023-07-02', uid: 'user1' }) },
    { id: 'app3', data: () => ({ status: 'Offer', company: 'Company C', createdAt: new Date(), dateApplied: '2023-07-03', uid: 'user1' }) },
  ];
  const mockResumes = [
    { id: 'resume1', data: () => ({ tag: 'v1', uid: 'user1' }) },
    { id: 'resume2', data: () => ({ tag: 'v2', uid: 'user1' }) },
  ];
  const mockInterviewEntries = [
    { id: 'entry1', data: () => ({ questionType: 'Coding', uid: 'user1' }) },
    { id: 'entry2', data: () => ({ questionType: 'Behavioral', uid: 'user1' }) },
  ];
  
  const mockFirebase = {
    collection: jest.fn((name) => {
      if (name === 'applications') {
        return {
          get: jest.fn().mockResolvedValue({ docs: mockApplications }),
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({ docs: mockApplications })
          })
        };
      }
      if (name === 'resumes') {
        return {
          get: jest.fn().mockResolvedValue({ docs: mockResumes }),
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({ docs: mockResumes })
          })
        };
      }
      if (name === 'interviewEntries') {
        return { 
          get: jest.fn().mockResolvedValue({ docs: mockInterviewEntries }),
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({ docs: mockInterviewEntries })
          })
        };
      }
      return { get: jest.fn().mockResolvedValue({ docs: [] }) };
    }),
  };
  
  return mockFirebase;
});

const app = express();
app.use(express.json());
app.use('/api', dashboardRoutes);

describe('Dashboard API', () => {
  test('GET /api/stats - returns dashboard stats', async () => {
    const res = await request(app).get('/api/stats?uid=test-user-id');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalApplications', 3);
    expect(res.body).toHaveProperty('resumePerformance');
    expect(res.body.resumePerformance).toHaveProperty('resumeVersions', 2);
    expect(res.body.applicationData).toBeInstanceOf(Array);
    expect(res.body.interviewData).toBeInstanceOf(Array);
  });

  test('GET /api/stats?uid=user1 - filters resumes by uid', async () => {
    const res = await request(app).get('/api/stats?uid=user1');
    expect(res.statusCode).toBe(200);
    expect(res.body.resumePerformance.resumeVersions).toBe(2);
  });

  test('GET /api/stats - missing uid returns 400', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing user ID');
  });

  test('GET /api/stats - server error', async () => {
    const mockFirebase = require('../firebase');
    mockFirebase.collection.mockImplementationOnce(() => { throw new Error('Firestore error'); });
    const res = await request(app).get('/api/stats?uid=user1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch dashboard stats');
  });
}); 