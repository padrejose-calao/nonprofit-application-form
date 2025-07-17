import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BasicInformation from '../BasicInformation';
import { validateBasicInformation } from '../../../utils/basicInformationValidation';

// Mock the validation module
jest.mock('../../../utils/basicInformationValidation');

describe('BasicInformation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateBasicInformation as jest.Mock).mockReturnValue({});
  });

  test('renders all navigation sections', () => {
    render(<BasicInformation />);
    
    expect(screen.getByText('Tax Identification')).toBeInTheDocument();
    expect(screen.getByText('Organization Identity')).toBeInTheDocument();
    expect(screen.getByText('Physical Address')).toBeInTheDocument();
    expect(screen.getByText('501(c)(3) Status')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Key Personnel')).toBeInTheDocument();
  });

  test('displays progress indicator', () => {
    render(<BasicInformation />);
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('shows Tax Identification section by default', () => {
    render(<BasicInformation />);
    
    expect(screen.getByText('Tax Identification')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tax ID Type/)).toBeInTheDocument();
  });

  test('navigates between sections', async () => {
    render(<BasicInformation />);
    const user = userEvent.setup();
    
    // Click on Organization Identity in navigation
    const orgIdentityNav = screen.getByRole('button', { name: /Organization Identity/i });
    await user.click(orgIdentityNav);
    
    // Should show Organization Identity section content
    expect(screen.getByText('Organization Legal Name')).toBeInTheDocument();
  });

  test('auto-saves form data every 30 seconds', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<BasicInformation />);
    
    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Auto-saving form data...');
    });
  });

  test('validates form data on change', async () => {
    const mockValidationErrors = {
      taxIdentification: {
        ein: 'Invalid EIN format'
      }
    };
    (validateBasicInformation as jest.Mock).mockReturnValue(mockValidationErrors);
    
    render(<BasicInformation />);
    
    // Trigger a form change
    const einInput = screen.getByPlaceholderText('XX-XXXXXXX');
    fireEvent.change(einInput, { target: { value: '123' } });
    
    await waitFor(() => {
      expect(validateBasicInformation).toHaveBeenCalled();
    });
  });

  test('shows/hides empty fields checkbox functionality', async () => {
    render(<BasicInformation />);
    const user = userEvent.setup();
    
    const checkbox = screen.getByLabelText(/Hide empty fields for export/i);
    expect(checkbox).not.toBeChecked();
    
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('displays custom section buttons', () => {
    render(<BasicInformation />);
    
    expect(screen.getByText('+ Add Custom Section')).toBeInTheDocument();
    expect(screen.getByText('+ Add Subsection')).toBeInTheDocument();
  });

  test('updates completed sections based on validation', async () => {
    const { rerender } = render(<BasicInformation />);
    
    // Mock validation returning no errors for a section
    (validateBasicInformation as jest.Mock).mockReturnValue({});
    
    // Trigger rerender to update completed sections
    rerender(<BasicInformation />);
    
    await waitFor(() => {
      // Progress should update when sections are complete
      expect(validateBasicInformation).toHaveBeenCalled();
    });
  });
});

describe('BasicInformation Integration Tests', () => {
  test('form data persists when switching sections', async () => {
    render(<BasicInformation />);
    const user = userEvent.setup();
    
    // Enter data in Tax Identification
    const einRadio = screen.getByLabelText(/Federal EIN/);
    await user.click(einRadio);
    
    // Switch to Organization Identity
    const orgIdentityNav = screen.getByRole('button', { name: /Organization Identity/i });
    await user.click(orgIdentityNav);
    
    // Switch back to Tax Identification
    const taxIdNav = screen.getByRole('button', { name: /Tax Identification/i });
    await user.click(taxIdNav);
    
    // Data should still be there
    expect(einRadio).toBeChecked();
  });

  test('section colors match specification', () => {
    const { container } = render(<BasicInformation />);
    
    // Tax Identification should have green background
    const mainContent = container.querySelector('.bg-green-50');
    expect(mainContent).toBeInTheDocument();
  });
});