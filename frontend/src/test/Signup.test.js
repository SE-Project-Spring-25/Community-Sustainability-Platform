// src/test/Signup.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../components/Signup';
import authService from '../services/authService';
import { BrowserRouter } from 'react-router-dom';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock authService
jest.mock('../services/authService');

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = () => {
    return render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
  };

  it('renders signup form step 1', () => {
    setup();
    expect(screen.getByPlaceholderText(/john/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
  });

  it('validates email and moves to step 2', async () => {
    setup();

    fireEvent.change(screen.getByPlaceholderText(/john/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/doe/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Password fields should now appear
    expect(await screen.findByPlaceholderText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('shows error for invalid email', () => {
    setup();

    fireEvent.change(screen.getByPlaceholderText(/john/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/doe/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'invalidemail' } });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  });

  it('submits signup form successfully', async () => {
    authService.getAccessToken.mockReturnValue(null);
    authService.register.mockResolvedValue({ access: 'test-access-token', refresh: 'test-refresh-token' });

    setup();

    // Fill step 1
    fireEvent.change(screen.getByPlaceholderText(/john/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/doe/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Fill step 2
    fireEvent.change(await screen.findByPlaceholderText(/at least 8 characters/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects immediately if already authenticated', () => {
    authService.getAccessToken.mockReturnValue('some-valid-token');

    setup();

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
