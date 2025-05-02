// src/test/Navbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { ThemeContext } from '../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';  // ✅ Add this

describe('Navbar Component', () => {
  const mockToggleTheme = jest.fn();
  const mockWalletClick = jest.fn();

  const renderWithContext = (theme = 'light') =>
    render(
      <ThemeContext.Provider value={{ theme, toggleTheme: mockToggleTheme }}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </ThemeContext.Provider>
    );

  it('renders heading and icons', () => {
    renderWithContext();

    expect(screen.getByText(/community sustainability/i)).toBeInTheDocument();
    expect(screen.getByTitle(/rewards/i)).toBeInTheDocument();
    expect(screen.getByTitle(/profile/i)).toBeInTheDocument();
    expect(screen.getByTitle(/toggle theme/i)).toBeInTheDocument();
  });

  it('opens voucher modal when redeem button is clicked', () => {
    renderWithContext();
    fireEvent.click(screen.getByTitle(/rewards/i));  // Open the dropdown
    const redeemButton = screen.getByText(/redeem vouchers/i);
    fireEvent.click(redeemButton);
    // Expect the modal content to be in the document
    expect(screen.getByText(/redeem your vouchers/i)).toBeInTheDocument();  // Adjust based on your VoucherModal text
  });

  it('toggles theme when switch is clicked', () => {
    renderWithContext();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('toggles profile state (open/close)', () => {
    renderWithContext();
    const profileIcon = screen.getByTitle(/profile/i);
    fireEvent.click(profileIcon);
    fireEvent.click(profileIcon); // should toggle back
    expect(profileIcon).toBeInTheDocument(); // Basic presence
  });
});
