// src/test/Sidebar.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '../components/Sidebar'; // adjust if needed

describe('Sidebar Component', () => {
  it('renders sidebar with rewards and profile items', () => {
    render(<Sidebar />);

    expect(screen.getByText(/rewards/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
  });
});
