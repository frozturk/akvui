import { KeyVault } from '@/types';
import { useEffect, useState } from 'react';

interface HeaderProps {
  selectedVault: KeyVault | null;
  keyVaults: KeyVault[];
  loading: boolean;
  onVaultSelect: (vault: KeyVault) => void;
  onAddVault: () => void;
  onDeleteVault: (id: string) => void;
}

export function Header({
  selectedVault,
  keyVaults,
  loading,
  onVaultSelect,
  onAddVault,
  onDeleteVault
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('darkMode') === 'true';
    setIsDark(isDarkStored);
    document.documentElement.classList.toggle('dark', isDarkStored);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Azure Key Vault Secrets Manager
      </h1>
      <div className="flex items-center space-x-6">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:opacity-80"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Key Vault:</label>
          <div className="flex items-center space-x-2">
            <select
              value={selectedVault?.id || ''}
              onChange={(e) => {
                const vault = keyVaults.find(v => v.id === e.target.value);
                if (vault) onVaultSelect(vault);
              }}
              className="block w-48 pl-3 pr-10 py-2 text-base rounded-md font-medium
                bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 
                text-gray-900 dark:text-gray-200 focus:border-indigo-500
                focus:outline-none focus:ring-indigo-500"
              disabled={loading || keyVaults.length === 0}
            >
              {keyVaults.length === 0 ? (
                <option value="">No Key Vaults</option>
              ) : (
                keyVaults.map(vault => (
                  <option key={vault.id} value={vault.id}>
                    {vault.name}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={onAddVault}
              className="p-2 text-indigo-600 hover:text-indigo-500 focus:outline-none"
              title="Add Key Vault"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            {selectedVault && (
              <button
                onClick={() => onDeleteVault(selectedVault.id)}
                className="p-2 text-red-600 hover:text-red-500 focus:outline-none"
                title="Remove Key Vault"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 