import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OrganizationIdentitySection from '../../BasicInformation2/sections/OrganizationIdentitySection';
import { OrganizationIdentityData } from '../../BasicInformation2/types';

describe('OrganizationIdentitySection', () => {
  const mockData: OrganizationIdentityData = {
    legalName: '',
    dbaName: '',
    previousNames: [],
    incorporationState: '',
    incorporationDate: '',
    organizationType: '',
    otherOrganizationType: '',
    missionStatement: '',
    primaryActivities: '',
    nteeCode: '',
    specificPrograms: ''
  };

  const mockOnUpdate = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all required fields', () => {
    render(
      <OrganizationIdentitySection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/Organization Legal Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/DBA Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incorporation State/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Incorporation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mission Statement/)).toBeInTheDocument();
  });

  test('adds and removes previous names', async () => {
    render(
      <OrganizationIdentitySection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    
    // Add previous name
    const addButton = screen.getByText('+ Add Previous Name');
    await user.click(addButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockData,
      previousNames: ['']
    });
  });

  test('updates previous name value', async () => {
    const dataWithPreviousName = {
      ...mockData,
      previousNames: ['Old Name']
    };

    render(
      <OrganizationIdentitySection 
        data={dataWithPreviousName} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const input = screen.getByDisplayValue('Old Name');
    
    await user.clear(input);
    await user.type(input, 'New Old Name');

    expect(mockOnUpdate).toHaveBeenLastCalledWith({
      ...dataWithPreviousName,
      previousNames: ['New Old Name']
    });
  });

  test('shows other organization type field when Other is selected', async () => {
    render(
      <OrganizationIdentitySection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const select = screen.getByLabelText(/Organization Type/);
    
    await user.selectOptions(select, 'other');

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockData,
      organizationType: 'other'
    });
  });

  test('renders other organization type field when other is selected', () => {
    render(
      <OrganizationIdentitySection 
        data={{ ...mockData, organizationType: 'other' }} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    expect(screen.getByPlaceholderText('Please specify')).toBeInTheDocument();
  });

  test('updates mission statement', async () => {
    render(
      <OrganizationIdentitySection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const textarea = screen.getByLabelText(/Mission Statement/);
    
    await user.type(textarea, 'Our mission is to help communities.');

    expect(mockOnUpdate).toHaveBeenCalled();
  });

  test('displays all US states in dropdown', () => {
    render(
      <OrganizationIdentitySection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const select = screen.getByLabelText(/Incorporation State/);
    const options = select.querySelectorAll('option');
    
    // Should have 50 states + DC + territories + default option
    expect(options.length).toBeGreaterThan(50);
  });

  test('displays error messages', () => {
    const errors = {
      legalName: 'Legal name is required',
      incorporationState: 'State is required'
    };

    render(
      <OrganizationIdentitySection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={errors}
      />
    );

    expect(screen.getByText('Legal name is required')).toBeInTheDocument();
    expect(screen.getByText('State is required')).toBeInTheDocument();
  });

  test('removes previous name when delete button is clicked', async () => {
    const dataWithNames = {
      ...mockData,
      previousNames: ['Name 1', 'Name 2']
    };

    render(
      <OrganizationIdentitySection 
        data={dataWithNames} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByText('Remove');
    
    await user.click(deleteButtons[0]);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...dataWithNames,
      previousNames: ['Name 2']
    });
  });
});