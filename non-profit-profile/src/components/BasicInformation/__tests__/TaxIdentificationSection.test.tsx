import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TaxIdentificationSection from '../../BasicInformation2/sections/TaxIdentificationSection';
import { TaxIdentificationData } from '../../BasicInformation2/types';

describe('TaxIdentificationSection', () => {
  const mockData: TaxIdentificationData = {
    taxIdType: '',
    ein: '',
    stateId: '',
    fiscalYearEnd: '',
    hasForeignActivities: false,
    foreignActivitiesDetails: '',
    hasSubstantialContributors: false,
    substantialContributorsDetails: '',
    hasLobbyingActivities: false,
    lobbyingActivitiesDetails: '',
    hasPoliticalActivities: false,
    politicalActivitiesDetails: ''
  };

  const mockOnUpdate = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all tax ID type options', () => {
    render(
      <TaxIdentificationSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/Federal EIN/)).toBeInTheDocument();
    expect(screen.getByLabelText(/State Tax ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/No Tax ID/)).toBeInTheDocument();
  });

  test('shows EIN field when Federal EIN is selected', async () => {
    render(
      <TaxIdentificationSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const einRadio = screen.getByLabelText(/Federal EIN/);
    
    await user.click(einRadio);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockData,
      taxIdType: 'ein'
    });
  });

  test('shows State ID field when State Tax ID is selected', async () => {
    render(
      <TaxIdentificationSection 
        data={{ ...mockData, taxIdType: 'state' }} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    expect(screen.getByPlaceholderText('Enter State Tax ID')).toBeInTheDocument();
  });

  test('formats EIN automatically', async () => {
    render(
      <TaxIdentificationSection 
        data={{ ...mockData, taxIdType: 'ein' }} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const einInput = screen.getByPlaceholderText('XX-XXXXXXX');
    
    await user.type(einInput, '123456789');

    expect(mockOnUpdate).toHaveBeenLastCalledWith({
      ...mockData,
      taxIdType: 'ein',
      ein: '12-3456789'
    });
  });

  test('displays error messages', () => {
    const errors = {
      ein: 'Invalid EIN format'
    };

    render(
      <TaxIdentificationSection 
        data={{ ...mockData, taxIdType: 'ein' }} 
        onUpdate={mockOnUpdate}
        errors={errors}
      />
    );

    expect(screen.getByText('Invalid EIN format')).toBeInTheDocument();
  });

  test('opens Additional Tax Information modal', async () => {
    render(
      <TaxIdentificationSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const button = screen.getByText('Additional Tax Information');
    
    await user.click(button);

    expect(screen.getByText('Foreign Activities')).toBeInTheDocument();
    expect(screen.getByText('Substantial Contributors')).toBeInTheDocument();
    expect(screen.getByText('Lobbying Activities')).toBeInTheDocument();
    expect(screen.getByText('Political Activities')).toBeInTheDocument();
  });

  test('updates foreign activities details when checkbox is checked', async () => {
    render(
      <TaxIdentificationSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    
    // Open modal
    await user.click(screen.getByText('Additional Tax Information'));
    
    // Check foreign activities
    const checkbox = screen.getByRole('checkbox', { name: /Foreign Activities/ });
    await user.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockData,
      hasForeignActivities: true
    });
  });

  test('shows textarea when activity checkbox is checked', async () => {
    render(
      <TaxIdentificationSection 
        data={{ ...mockData, hasForeignActivities: true }} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByText('Additional Tax Information'));

    const textarea = screen.getByPlaceholderText(/Please describe foreign activities/);
    expect(textarea).toBeInTheDocument();
  });
});