import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EditSecretModal } from '../EditSecretModal';
import { EditModal, KeyVault } from '@/types';
import { createOrUpdateSecret } from '@/app/actions';

// Mock the actions module
jest.mock('@/app/actions', () => ({
  createOrUpdateSecret: jest.fn(),
}));

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

describe('EditSecretModal Component', () => {
  const mockVault: KeyVault = {
    id: '1',
    name: 'Test Vault',
    value: 'https://test-vault.vault.azure.net',
  };

  const mockEditModal: EditModal = {
    isOpen: true,
    secret: {
      name: 'test-secret',
      value: 'test-value',
      enabled: true,
    },
  };

  const mockProps = {
    editModal: mockEditModal,
    onClose: jest.fn(),
    onValueChange: jest.fn(),
    selectedVault: mockVault,
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('renders nothing when modal is closed', () => {
    const { container } = render(
      <EditSecretModal {...mockProps} editModal={{ isOpen: false, secret: null }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal content when open', () => {
    render(<EditSecretModal {...mockProps} />);
    expect(screen.getByText('Edit Secret')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-secret')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-value')).toBeInTheDocument();
  });

  it('calls onValueChange when secret value is changed', () => {
    render(<EditSecretModal {...mockProps} />);
    const valueInput = screen.getByDisplayValue('test-value');
    fireEvent.change(valueInput, { target: { value: 'new-value' } });
    expect(mockProps.onValueChange).toHaveBeenCalledWith('new-value');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<EditSecretModal {...mockProps} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when close icon is clicked', () => {
    render(<EditSecretModal {...mockProps} />);
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('shows confirmation dialog and updates secret when save is clicked', async () => {
    (createOrUpdateSecret as jest.Mock).mockResolvedValueOnce({});
    render(<EditSecretModal {...mockProps} />);
    const saveButton = screen.getByText('Save Changes');
    
    fireEvent.click(saveButton);
    
    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to update the secret "test-secret" in key vault "Test Vault"? This action cannot be undone.'
    );
    
    await expect(createOrUpdateSecret).toHaveBeenCalledWith(
      mockVault.value,
      mockEditModal.secret!.name,
      mockEditModal.secret!.value
    );
  });

  it('does not update secret when confirmation is cancelled', async () => {
    mockConfirm.mockReturnValueOnce(false);
    render(<EditSecretModal {...mockProps} />);
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(createOrUpdateSecret).not.toHaveBeenCalled();
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('handles error when updating secret fails', async () => {
    const error = new Error('Failed to update secret');
    (createOrUpdateSecret as jest.Mock).mockRejectedValueOnce(error);

    render(<EditSecretModal {...mockProps} />);
    const saveButton = screen.getByText('Save Changes');
    
    await act(async () => {
      fireEvent.click(saveButton);
      // Wait for the next tick to allow error handling to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockProps.onError).toHaveBeenCalledWith('Failed to update secret');
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });
}); 