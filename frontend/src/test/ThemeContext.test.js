import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, ThemeContext } from '../context/ThemeContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  const TestComponent = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return (
      <div>
        <p data-testid="theme-value">{theme}</p>
        <button onClick={toggleTheme}>Toggle</button>
      </div>
    );
  };

  it('provides default theme from localStorage or fallback to dark', () => {
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(document.body.className).toBe('light');
  });

  it('toggles theme between light and dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByText(/toggle/i);
    const themeText = screen.getByTestId('theme-value');

    expect(themeText.textContent).toBe('dark');

    fireEvent.click(button);
    expect(themeText.textContent).toBe('light');
    expect(document.body.className).toBe('light');

    fireEvent.click(button);
    expect(themeText.textContent).toBe('dark');
    expect(document.body.className).toBe('dark');
  });

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByText(/toggle/i);
    fireEvent.click(button); 

    expect(localStorage.getItem('theme')).toBe('light');
    fireEvent.click(button); 
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
