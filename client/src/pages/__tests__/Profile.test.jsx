// client/src/pages/__tests__/ProfilePage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../Profile';

import axios from 'axios';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'testuid', email: 'test@example.com' } })
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  put: jest.fn()
}));


const mockProfile = {
  name: 'Test User',
  bio: 'A short bio',
  location: 'Earth',
  skills: 'React, Node',
  education: 'BS',
  experience: '2 years',
  linkedinId: 'test-linkedin',
  leetcodeId: 'test-leetcode',
  githubId: 'test-github',
  portfolioId: 'test-portfolio'
};


describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockProfile });
    axios.put.mockResolvedValue({ data: mockProfile });
  });

  test('renders loading state', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders profile fields', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    expect(screen.getByText('A short bio')).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('React, Node')).toBeInTheDocument();
    expect(screen.getByText('BS')).toBeInTheDocument();
    expect(screen.getByText('2 years')).toBeInTheDocument();
  });

  test('allows editing and saving profile', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Edit Profile'));
    const nameInput = screen.getByPlaceholderText(/enter your name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });
}); 