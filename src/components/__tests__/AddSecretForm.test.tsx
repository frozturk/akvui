import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AddSecretForm } from '../AddSecretForm';
import { KeyVault } from '@/types';
import { createOrUpdateSecret } from '@/app/actions';

// Mock the actions module
jest.mock('@/app/actions', () => ({
  createOrUpdateSecret: jest.fn(),
}));

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

describe('AddSecretForm Component', () => {
  const mockVault: KeyVault = {
    id: '1',
    name: 'Test Vault',
    value: 'https://test-vault.vault.azure.net',
  };

  const mockProps = {
    selectedVault: mockVault,
    onError: jest.fn(),
    onSecretAdded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('renders the form with empty inputs', () => {
    render(<AddSecretForm {...mockProps} />);
    expect(screen.getByText('Add New Secret')).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText('Secret Name');
    const valueInput = screen.getByLabelText('Secret Value');
    
    expect(nameInput).toHaveValue('');
    expect(valueInput).toHaveValue('');
  });

  it('updates input values when typing', () => {
    render(<AddSecretForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Secret Name');
    const valueInput = screen.getByLabelText('Secret Value');
    
    fireEvent.change(nameInput, { target: { value: 'new-secret' } });
    fireEvent.change(valueInput, { target: { value: 'secret-value' } });
    
    expect(nameInput).toHaveValue('new-secret');
    expect(valueInput).toHaveValue('secret-value');
  });

  it('shows confirmation dialog and creates secret when form is submitted', async () => {
    render(<AddSecretForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Secret Name');
    const valueInput = screen.getByLabelText('Secret Value');
    const submitButton = screen.getByText('Add Secret');
    
    fireEvent.change(nameInput, { target: { value: 'new-secret' } });
    fireEvent.change(valueInput, { target: { value: 'secret-value' } });
    fireEvent.click(submitButton);
    
    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to create a new secret "new-secret" in key vault "Test Vault"? This action cannot be undone.'
    );
    
    expect(createOrUpdateSecret).toHaveBeenCalledWith(
      mockVault.value,
      'new-secret',
      'secret-value'
    );
  });

  it('does not create secret when confirmation is cancelled', () => {
    mockConfirm.mockReturnValueOnce(false);
    render(<AddSecretForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Secret Name');
    const valueInput = screen.getByLabelText('Secret Value');
    const submitButton = screen.getByText('Add Secret');
    
    fireEvent.change(nameInput, { target: { value: 'new-secret' } });
    fireEvent.change(valueInput, { target: { value: 'secret-value' } });
    fireEvent.click(submitButton);
    
    expect(createOrUpdateSecret).not.toHaveBeenCalled();
  });

  it('handles error when creating secret fails', async () => {
    const error = new Error('Failed to create secret');
    (createOrUpdateSecret as jest.Mock).mockRejectedValueOnce(error);
    
    render(<AddSecretForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Secret Name');
    const valueInput = screen.getByLabelText('Secret Value');
    const submitButton = screen.getByText('Add Secret');
    
    fireEvent.change(nameInput, { target: { value: 'new-secret' } });
    fireEvent.change(valueInput, { target: { value: 'secret-value' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    expect(mockProps.onError).toHaveBeenCalledWith('Failed to create secret');
  });

  it('clears form and calls onSecretAdded after successful submission', async () => {
    (createOrUpdateSecret as jest.Mock).mockResolvedValueOnce({});
    
    render(<AddSecretForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Secret Name');
    const valueInput = screen.getByLabelText('Secret Value');
    const submitButton = screen.getByText('Add Secret');
    
    fireEvent.change(nameInput, { target: { value: 'new-secret' } });
    fireEvent.change(valueInput, { target: { value: 'secret-value' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    expect(nameInput).toHaveValue('');
    expect(valueInput).toHaveValue('');
    expect(mockProps.onSecretAdded).toHaveBeenCalled();
  });

  it('disables form inputs and submit button while loading', async () => {
    // Make the createOrUpdateSecret function take some time to resolve
    (createOrUpdateSecret as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AddSecretForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Secret Name');
    const valueInput = screen.getByLabelText('Secret Value');
    const submitButton = screen.getByText('Add Secret');
    
    fireEvent.change(nameInput, { target: { value: 'new-secret' } });
    fireEvent.change(valueInput, { target: { value: 'secret-value' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    expect(nameInput).toBeDisabled();
    expect(valueInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
}); 