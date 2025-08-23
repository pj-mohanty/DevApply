// src/pages/__tests__/ForgotPasswordPage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '../ForgotPasswordPage';

// Mock the firebase.js module with a basic auth object
jest.mock('../../firebase', () => ({
  auth: {}, // mock auth object
}));

// Mock the firebase/auth module with the necessary functions your component uses
jest.mock('firebase/auth', () => ({
  fetchSignInMethodsForEmail: jest.fn(() => Promise.resolve(['password'])),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve('mock-success')),
}));

describe('ForgotPasswordPage', () => {
  test('renders form, allows input, and submits without errors', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    expect(emailInput).toBeInTheDocument();

    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset email/i });
    expect(submitButton).toBeInTheDocument();

    await userEvent.click(submitButton);
  });
});
