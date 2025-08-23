// client/src/pages/__tests__/TrackerPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Tracker from '../Tracker';

import axios from 'axios';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'testuid' } })
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  delete: jest.fn()
}));

const mockApplications = [
  { id: 1, jobTitle: 'Frontend Dev', company: 'Google', status: 'Applied', dateApplied: '2023-01-01', applicationLink: '', jobDescription: '', resume: '' },
  { id: 2, jobTitle: 'Backend Dev', company: 'Meta', status: 'Interview Scheduled', dateApplied: '2023-01-02', applicationLink: '', jobDescription: '', resume: '' }
];

const mockResumes = [
  { id: 'r1', name: 'Resume 1' },
  { id: 'r2', name: 'Resume 2' }
];


describe('Tracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/applications')) return Promise.resolve({ data: mockApplications });
      if (url.includes('/api/resume')) return Promise.resolve({ data: mockResumes });
      return Promise.resolve({ data: [] });
    });
  });

  test('renders tracker and stat cards', async () => {
    render(
      <MemoryRouter>
        <Tracker />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/application tracker/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/total applications/i)).toBeInTheDocument();
    expect(screen.getByText('Frontend Dev')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  test('shows no applications found if filter returns empty', async () => {
    render(
      <MemoryRouter>
        <Tracker />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Frontend Dev')).toBeInTheDocument();
    });
    // Select a status not present
    fireEvent.change(screen.getByDisplayValue('All'), { target: { value: 'Offer' } });
    expect(screen.getByText(/no applications found/i)).toBeInTheDocument();
  });
}); 