import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SecretsTable } from '../SecretsTable';
import { Secret, KeyVault } from '@/types';
import { getSecretByName } from '@/app/actions';

// Mock the actions module
jest.mock('@/app/actions', () => ({
  getSecretByName: jest.fn(),
}));

describe('SecretsTable Component', () => {
  const mockVault: KeyVault = {
    id: '1',
    name: 'Test Vault',
    value: 'https://test-vault.vault.azure.net',
  };

  const mockSecrets: Secret[] = [
    {
      name: 'secret1',
      enabled: true,
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-02T00:00:00Z',
    },
    {
      name: 'secret2',
      enabled: false,
      created: '2024-01-03T00:00:00Z',
      updated: '2024-01-04T00:00:00Z',
    },
  ];

  const mockProps = {
    selectedVault: mockVault,
    onError: jest.fn(),
    loading: false,
    secrets: mockSecrets,
    onSecretsChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table headers', () => {
    render(<SecretsTable {...mockProps} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders secrets data correctly', () => {
    render(<SecretsTable {...mockProps} />);
    expect(screen.getByText('secret1')).toBeInTheDocument();
    expect(screen.getByText('secret2')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(<SecretsTable {...mockProps} loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('filters secrets based on search query', () => {
    render(<SecretsTable {...mockProps} />);
    const searchInput = screen.getByPlaceholderText('Search by secret name');
    fireEvent.change(searchInput, { target: { value: 'secret1' } });
    expect(screen.getByText('secret1')).toBeInTheDocument();
    expect(screen.queryByText('secret2')).not.toBeInTheDocument();
  });

  it('shows "No secrets found" message when search has no results', () => {
    render(<SecretsTable {...mockProps} />);
    const searchInput = screen.getByPlaceholderText('Search by secret name');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.getByText('No secrets found matching your search')).toBeInTheDocument();
  });

  it('shows "No secrets available" message when secrets array is empty', () => {
    render(<SecretsTable {...mockProps} secrets={[]} />);
    expect(screen.getByText('No secrets available')).toBeInTheDocument();
  });

  it('calls startEditing when edit button is clicked', async () => {
    const mockSecret = { name: 'secret1', value: 'test-value', enabled: true };
    (getSecretByName as jest.Mock).mockResolvedValueOnce(mockSecret);
    
    render(<SecretsTable {...mockProps} />);
    const editButton = screen.getAllByText('Edit')[0];
    
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    expect(getSecretByName).toHaveBeenCalledWith(mockVault.value, 'secret1');
  });

  it('disables edit button for disabled secrets', () => {
    render(<SecretsTable {...mockProps} />);
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons[1]).toBeDisabled();
    expect(editButtons[1]).toHaveAttribute('title', 'Cannot edit disabled secrets');
  });

  it('handles error when fetching secret details', async () => {
    const error = new Error('Failed to fetch secret');
    (getSecretByName as jest.Mock).mockRejectedValueOnce(error);
    
    render(<SecretsTable {...mockProps} />);
    const editButton = screen.getAllByText('Edit')[0];
    
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    expect(mockProps.onError).toHaveBeenCalledWith('Failed to fetch secret');
  });
}); 