import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UtilitiesModal from '../components/UtilitiesModal';
import API from '../api';

// Mock API
jest.mock('../api', () => ({
  post: jest.fn(),
}));

describe('UtilitiesModal Component', () => {
  const mockClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    API.post.mockResolvedValue({ data: {} }); // ✅ prevent undefined error
  });

  it('renders and submits Household Energy form', async () => {
    render(<UtilitiesModal open={true} onClose={mockClose} />);

    fireEvent.change(screen.getByLabelText(/utility type/i), { target: { value: 'Household Energy' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-05-01' } });
    fireEvent.change(screen.getByLabelText(/energy usage/i), { target: { value: '120' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining('/household-energy/'),
        expect.objectContaining({
          date: '2024-05-01',
          energy_usage: 120,
        })
      );
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('renders and submits Food Consumption form', async () => {
    render(<UtilitiesModal open={true} onClose={mockClose} />);

    fireEvent.change(screen.getByLabelText(/utility type/i), { target: { value: 'Food Consumption' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-05-02' } });
    fireEvent.change(screen.getByLabelText(/servings/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/food type/i), { target: { value: 'plant' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining('/food-consumption/'),
        expect.objectContaining({
          date: '2024-05-02',
          servings: 3,
          food_type: 'plant',
        })
      );
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('renders and submits Transportation Emission form', async () => {
    render(<UtilitiesModal open={true} onClose={mockClose} />);

    fireEvent.change(screen.getByLabelText(/utility type/i), { target: { value: 'Transportation Emission' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-05-03' } });
    fireEvent.change(screen.getByLabelText(/distance/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/mode/i), { target: { value: 'car' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining('/transportation-emissions/'),
        expect.objectContaining({
          date: '2024-05-03',
          distance: 50,
          mode: 'car',
        })
      );
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('closes modal when clicking outside', () => {
    render(<UtilitiesModal open={true} onClose={mockClose} />);

    fireEvent.click(screen.getByText(/add utility record/i).closest('.modal-overlay'));

    expect(mockClose).toHaveBeenCalled();
  });
});
