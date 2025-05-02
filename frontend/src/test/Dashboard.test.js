import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard'; // adjust path if needed
import { ThemeContext } from '../context/ThemeContext'; // adjust path if needed

// ✅ Mock Chart.js charts used in StatsSection
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />,
  Doughnut: () => <div data-testid="mock-doughnut-chart" />
}));

describe('Dashboard Component', () => {
  it('renders all sections', () => {
    render(
      <ThemeContext.Provider value={{ theme: 'dark' }}>
        <Dashboard />
      </ThemeContext.Provider>
    );

    expect(screen.getByTestId('content-section')).toBeInTheDocument();
    expect(screen.getByTestId('stats-section')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-section')).toBeInTheDocument();

    // Optional: confirm mocked charts appear
    expect(screen.getByTestId('mock-doughnut-chart')).toBeInTheDocument();
  });
});
