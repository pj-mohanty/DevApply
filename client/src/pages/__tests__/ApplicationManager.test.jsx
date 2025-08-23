// client/src/pages/__tests__/ApplicationManagerPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApplicationManager from '../ApplicationManager';

import axios from 'axios';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'testuid' } })
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));


const mockApplications = [
  { id: 1, jobTitle: 'Frontend Dev', company: 'Google', status: 'Applied', dateApplied: '2023-01-01', applicationLink: '', jobDescription: '', resume: '' }
];

const mockResumes = [
  { id: 'r1', name: 'Resume 1' }
];


describe('ApplicationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/applications')) return Promise.resolve({ data: mockApplications });
      if (url.includes('/api/resume')) return Promise.resolve({ data: mockResumes });
      return Promise.resolve({ data: [] });
    });
    axios.post.mockResolvedValue({ data: { ...mockApplications[0], id: 2 } });
    axios.put.mockResolvedValue({ data: mockApplications[0] });
    axios.delete.mockResolvedValue({});
  });

  test('renders application manager and form', async () => {
    render(
      <MemoryRouter>
        <ApplicationManager />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/job application tracker/i)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/job title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/company/i)).toBeInTheDocument();
  });

}); 