import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OrganizationalAddressSection from '../../BasicInformation2/sections/OrganizationalAddressSection';
import { OrganizationalAddressData } from '../../BasicInformation2/types';

describe('OrganizationalAddressSection', () => {
  const mockData: OrganizationalAddressData = {
    physicalAddress: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    mailingAddress: {
      sameAsPhysical: true,
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    registeredAgent: {
      hasAgent: false,
      agentName: '',
      agentAddress: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    }
  };

  const mockOnUpdate = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders physical address fields', () => {
    render(
      <OrganizationalAddressSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    expect(screen.getByText('Physical Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123 Main Street')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Suite 100')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
    expect(screen.getByLabelText(/State/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('12345')).toBeInTheDocument();
  });

  test('mailing address is disabled when same as physical', () => {
    render(
      <OrganizationalAddressSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const mailingInputs = screen.getAllByPlaceholderText('123 Main Street');
    expect(mailingInputs[1]).toBeDisabled();
  });

  test('enables mailing address when checkbox is unchecked', async () => {
    render(
      <OrganizationalAddressSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const checkbox = screen.getByLabelText(/Same as physical address/);
    
    await user.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockData,
      mailingAddress: {
        ...mockData.mailingAddress,
        sameAsPhysical: false
      }
    });
  });

  test('shows registered agent fields when checkbox is checked', async () => {
    render(
      <OrganizationalAddressSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const checkbox = screen.getByLabelText(/Organization has a registered agent/);
    
    await user.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockData,
      registeredAgent: {
        ...mockData.registeredAgent,
        hasAgent: true
      }
    });
  });

  test('updates physical address fields', async () => {
    render(
      <OrganizationalAddressSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const streetInput = screen.getAllByPlaceholderText('123 Main Street')[0];
    
    await user.type(streetInput, '456 Oak Ave');

    expect(mockOnUpdate).toHaveBeenCalled();
    const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
    expect(lastCall.physicalAddress.street1).toBe('456 Oak Ave');
  });

  test('validates ZIP code format', async () => {
    render(
      <OrganizationalAddressSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const zipInput = screen.getAllByPlaceholderText('12345')[0];
    
    await user.type(zipInput, '12345-6789');

    const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
    expect(lastCall.physicalAddress.zipCode).toBe('12345-6789');
  });

  test('displays error messages', () => {
    const errors = {
      'physicalAddress.street1': 'Street address is required',
      'physicalAddress.city': 'City is required',
      'physicalAddress.state': 'State is required',
      'physicalAddress.zipCode': 'ZIP code is required'
    };

    render(
      <OrganizationalAddressSection 
        data={mockData} 
        onUpdate={mockOnUpdate}
        errors={errors}
      />
    );

    expect(screen.getByText('Street address is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(screen.getByText('State is required')).toBeInTheDocument();
    expect(screen.getByText('ZIP code is required')).toBeInTheDocument();
  });

  test('registered agent fields are shown when hasAgent is true', () => {
    const dataWithAgent = {
      ...mockData,
      registeredAgent: {
        ...mockData.registeredAgent,
        hasAgent: true
      }
    };

    render(
      <OrganizationalAddressSection 
        data={dataWithAgent} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    expect(screen.getByPlaceholderText('Registered Agent Name')).toBeInTheDocument();
    expect(screen.getByText('Registered Agent Address')).toBeInTheDocument();
  });

  test('copies physical address to mailing when same checkbox is checked', async () => {
    const dataWithDifferentMailing = {
      ...mockData,
      physicalAddress: {
        street1: '123 Main St',
        street2: 'Suite 100',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      mailingAddress: {
        sameAsPhysical: false,
        street1: '456 Other St',
        street2: '',
        city: 'Other City',
        state: 'NY',
        zipCode: '54321',
        country: 'USA'
      }
    };

    render(
      <OrganizationalAddressSection 
        data={dataWithDifferentMailing} 
        onUpdate={mockOnUpdate}
        errors={mockErrors}
      />
    );

    const user = userEvent.setup();
    const checkbox = screen.getByLabelText(/Same as physical address/);
    
    await user.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...dataWithDifferentMailing,
      mailingAddress: {
        sameAsPhysical: true,
        ...dataWithDifferentMailing.physicalAddress
      }
    });
  });
});