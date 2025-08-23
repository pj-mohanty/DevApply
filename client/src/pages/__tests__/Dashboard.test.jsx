// client/src/pages/__tests__/DashboardPage.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'testuid' } })
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn()
}));

const mockDashboardData = {
  totalApplications: 5,
  interviewsCompleted: 2,
  successRate: 40,
  applicationData: [
    { name: 'Applied', value: 3, color: '#000' },
    { name: 'Interview Scheduled', value: 1, color: '#111' },
    { name: 'Rejected', value: 1, color: '#222' }
  ],
  interviewData: [
    { name: 'Completed', value: 2, color: '#333' },
    { name: 'Scheduled', value: 1, color: '#444' }
  ],
  recentActivities: [
    { type: 'applied', icon: '📄', text: 'Applied to Google', date: '2023-01-01', time: '10:00' }
  ],
  upcomingEvents: [],
  resumePerformance: {
    resumeVersions: 0,
    interviewRate: 0,
    linkedApplications: 0,
    resumeTags: []
  }
};

import axios from 'axios';

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  test('renders error state', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument();
    });
  });
}); 