const request = require('supertest');
const express = require('express');
const journalRoutes = require('../routes/journal');

// Use a consistent test uid for mock and test
const TEST_UID = 'test-user-123';

// mock firebase-admin to simulate Firestore
jest.mock('firebase-admin', () => {
  const mockApplicationsSnap = {
    docs: [
      {
        id: 'app1',
        data: () => ({
          uid: TEST_UID,
          jobTitle: 'SWE',
          company: 'OpenAI',
          status: 'Pending',
        }),
      },
    ],
  };

  const mockEntriesSnap = {
    docs: [
      {
        id: 'entry1',
        data: () => ({
          uid: TEST_UID,
          applicationId: 'app1',
          question: 'Q1',
          response: 'R1',
          interviewName: 'Round 1',
        }),
      },
      {
        id: 'entry2',
        data: () => ({
          uid: TEST_UID,
          question: 'Unlinked Q',
          response: 'Unlinked R',
          // no applicationId — unlinked
        }),
      },
    ],
  };

  const mockFirestore = {
    collection: jest.fn((name) => ({
      where: jest.fn(() => ({
        get: () => {
          if (name === 'applications') {
            return Promise.resolve(mockApplicationsSnap);
          }
          if (name === 'interviewEntries') {
            return Promise.resolve(mockEntriesSnap);
          }
          return Promise.resolve({ docs: [] });
        },
      })),
    })),
  };

  return {
    firestore: () => mockFirestore,
  };
});

const app = express();
app.use('/api', journalRoutes);

describe('GET /api/journal-entries', () => {
  test('should return linked and unlinked journal entries', async () => {
    const res = await request(app).get(`/api/journal-entries?uid=${TEST_UID}`);

    expect(res.statusCode).toBe(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'app1',
          company: 'OpenAI',
          jobTitle: 'SWE',
          status: 'Pending',
          entries: expect.arrayContaining([
            expect.objectContaining({
              question: 'Q1',
              interviewName: 'Round 1',
            }),
          ]),
        }),
        expect.objectContaining({
          id: null,
          entries: expect.arrayContaining([
            expect.objectContaining({
              question: 'Unlinked Q',
              interviewName: '', // Default fallback
            }),
          ]),
        }),
      ])
    );
  });
});