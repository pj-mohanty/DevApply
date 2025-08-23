import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JournalPage from '../JournalPage';
import { useAuth } from '../../context/AuthContext';
import { getJournalEntries } from '../../utils/api';
import userEvent from '@testing-library/user-event';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="react-markdown">{children}</div>
}));
jest.mock('rehype-highlight', () => () => {});
jest.mock('remark-gfm', () => () => {});
jest.mock('highlight.js/styles/github-dark.css', () => {});
jest.mock('../../utils/api', () => ({
  getJournalEntries: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockJobs = [
  {
    id: '1',
    jobTitle: 'Frontend Dev',
    company: 'Google',
    entries: [{ id: 'e1' }, { id: 'e2' }] // mock entries
  },
  {
    id: '2',
    jobTitle: 'Backend Dev',
    company: 'Amazon',
    entries: [{ id: 'e3' }]
  }
];

describe('JournalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and displays journal entries for authenticated user', async () => {
    useAuth.mockReturnValue({ user: { uid: 'testuid' } });
    getJournalEntries.mockResolvedValue(mockJobs);

    render(
      <MemoryRouter>
        <JournalPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getJournalEntries).toHaveBeenCalledWith('testuid');
    });

    expect(screen.getByText(/Frontend Dev/)).toBeInTheDocument();
    expect(screen.getByText(/Backend Dev/)).toBeInTheDocument();
  });

  test('clicking + New Entry navigates to /interview', async () => {
    useAuth.mockReturnValue({ user: { uid: 'testuid' } });
    getJournalEntries.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <JournalPage />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /\+ new entry/i });
    await userEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/interview');
  });

  test('does not call API if user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <JournalPage />
      </MemoryRouter>
    );

    expect(getJournalEntries).not.toHaveBeenCalled();
  });
});