import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeBuilder from '../../components/resume/ResumeBuilder';
import { useAuth } from '../../context/AuthContext';
import {
  saveResume,
  getLatestResume,
  polishResumeByAI
} from '../../utils/api';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../utils/api', () => ({
  saveResume: jest.fn(),
  getLatestResume: jest.fn(),
  getResumeByTag: jest.fn(),
  updateResumeByTag: jest.fn(),
  polishResumeByAI: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('ResumeBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { uid: 'test-uid' } });
    getLatestResume.mockResolvedValue({
      fullName: '',
      education: [],
      experience: [],
      projects: [],
      awards: [],
      tag: 'fullstack'
    });
  });

  test('renders the form and allows input', async () => {
    render(<ResumeBuilder mode="create" />, { wrapper: MemoryRouter });

    const input = await screen.findByLabelText(/full name/i);
    await userEvent.type(input, 'Jane Doe');
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
  });

  test('clicking Save Draft calls saveResume', async () => {
    render(<ResumeBuilder mode="create" />, { wrapper: MemoryRouter });

    const input = await screen.findByLabelText(/full name/i);
    await userEvent.type(input, 'Jane Doe');

    const tagInput = screen.getByPlaceholderText(/e\.g\., Fullstack/i);
    await userEvent.clear(tagInput);
    await userEvent.type(tagInput, 'ai');

    const [projectDescInput, experienceDescInput] = await screen.findAllByLabelText(/description/i);
    await userEvent.type(projectDescInput, 'This is a project');
    await userEvent.type(experienceDescInput, 'Worked on something');

    const saveButton = screen.getAllByRole('button', { name: /save draft/i })[0];
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(saveResume).toHaveBeenCalledWith('test-uid', expect.objectContaining({
        fullName: 'Jane Doe',
        tag: 'ai'
      }));
    });
  });

  test('clicking AI Optimize calls polishResumeByAI', async () => {
    polishResumeByAI.mockResolvedValue({
      fullName: 'Polished Name',
      education: [],
      experience: [],
      projects: [],
      awards: [],
      tag: 'ai'
    });

    render(<ResumeBuilder mode="create" />, { wrapper: MemoryRouter });

    const polishButton = screen.getByRole('button', { name: /ai optimize resume/i });
    await userEvent.click(polishButton);

    const polishedInput = await screen.findByDisplayValue('Polished Name');
    expect(polishedInput).toBeInTheDocument();
  });
});