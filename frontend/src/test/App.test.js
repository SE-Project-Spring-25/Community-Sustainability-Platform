import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import authService from '../services/authService';

// Mock authService
jest.mock('../services/authService');

// Setup mock navigation state via actual window.location simulation
const setPath = (path) => {
  window.history.pushState({}, '', path);
};

describe('App Routing and Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when unauthenticated', () => {
    authService.isAuthenticated.mockReturnValue(false);
    setPath('/dashboard');

    render(<App />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders dashboard and navbar when authenticated', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    setPath('/dashboard');

    render(<App />);

    expect(screen.getByText(/community sustainability/i)).toBeInTheDocument(); // Navbar
    expect(await screen.findByTestId('content-section')).toBeInTheDocument();  // Dashboard
  });

  it('shows rewards dropdown when wallet icon is clicked', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    setPath('/dashboard');
  
    render(<App />);
  
    fireEvent.click(screen.getByTitle(/rewards/i));
  
    // Instead of looking for a page, check that the dropdown appears:
    expect(await screen.findByText(/balance:/i)).toBeInTheDocument();
    expect(await screen.findByText(/redeem vouchers/i)).toBeInTheDocument();
  });

  it('redirects unknown route to login', () => {
    authService.isAuthenticated.mockReturnValue(false);
    setPath('/unknown-path');

    render(<App />);
    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument(); // Login
  });
});
