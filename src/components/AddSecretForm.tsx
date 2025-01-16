import { useState } from 'react';
import { KeyVault } from '@/types';
import { createOrUpdateSecret } from '@/app/actions';

interface AddSecretFormProps {
  selectedVault: KeyVault | null;
  onError: (error: string) => void;
  onSecretAdded: () => void;
}

export function AddSecretForm({
  selectedVault,
  onError,
  onSecretAdded
}: AddSecretFormProps) {
  const [loading, setLoading] = useState(false);
  const [newSecret, setNewSecret] = useState({ name: '', value: '' });

  const addSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVault) return;

    if (!window.confirm(`Are you sure you want to create a new secret "${newSecret.name}" in key vault "${selectedVault.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await createOrUpdateSecret(selectedVault.value, newSecret.name, newSecret.value);
      setNewSecret({ name: '', value: '' });
      onSecretAdded();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg shadow p-6 mb-8 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Secret</h2>
      <form onSubmit={addSecret} className="space-y-4">
        <div>
          <label htmlFor="secretName" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
            Secret Name
          </label>
          <input
            id="secretName"
            type="text"
            value={newSecret.name}
            onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
            className="mt-1 block w-full rounded-md shadow-sm font-medium
              bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
              text-gray-900 dark:text-gray-200 focus:border-indigo-500
              focus:ring-indigo-500"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="secretValue" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
            Secret Value
          </label>
          <input
            id="secretValue"
            type="text"
            value={newSecret.value}
            onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
            className="mt-1 block w-full rounded-md shadow-sm font-medium
              bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
              text-gray-900 dark:text-gray-200 focus:border-indigo-500
              focus:ring-indigo-500"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Add Secret
        </button>
      </form>
    </div>
  );
} 