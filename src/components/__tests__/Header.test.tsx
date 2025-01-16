import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { KeyVault } from '@/types';

describe('Header Component', () => {
  const mockKeyVaults: KeyVault[] = [
    { id: '1', name: 'Vault 1', value: 'https://vault1.vault.azure.net' },
    { id: '2', name: 'Vault 2', value: 'https://vault2.vault.azure.net' },
  ];

  const mockProps = {
    selectedVault: mockKeyVaults[0],
    keyVaults: mockKeyVaults,
    loading: false,
    onVaultSelect: jest.fn(),
    onAddVault: jest.fn(),
    onDeleteVault: jest.fn(),
  };

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });
  });

  it('renders the header title', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Azure Key Vault Secrets Manager')).toBeInTheDocument();
  });

  it('renders the vault selector with options', () => {
    render(<Header {...mockProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Vault 1')).toBeInTheDocument();
    expect(screen.getByText('Vault 2')).toBeInTheDocument();
  });

  it('calls onVaultSelect when a vault is selected', () => {
    render(<Header {...mockProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(mockProps.onVaultSelect).toHaveBeenCalledWith(mockKeyVaults[1]);
  });

  it('calls onAddVault when add button is clicked', () => {
    render(<Header {...mockProps} />);
    const addButton = screen.getByTitle('Add Key Vault');
    fireEvent.click(addButton);
    expect(mockProps.onAddVault).toHaveBeenCalled();
  });

  it('calls onDeleteVault when delete button is clicked', () => {
    render(<Header {...mockProps} />);
    const deleteButton = screen.getByTitle('Remove Key Vault');
    fireEvent.click(deleteButton);
    expect(mockProps.onDeleteVault).toHaveBeenCalledWith(mockKeyVaults[0].id);
  });

  it('disables vault selector when loading', () => {
    render(<Header {...mockProps} loading={true} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('shows "No Key Vaults" when no vaults are available', () => {
    render(<Header {...mockProps} keyVaults={[]} />);
    expect(screen.getByText('No Key Vaults')).toBeInTheDocument();
  });

  it('toggles dark mode when theme button is clicked', () => {
    render(<Header {...mockProps} />);
    const themeButton = screen.getByTitle('Switch to Dark Mode');
    fireEvent.click(themeButton);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });
}); 