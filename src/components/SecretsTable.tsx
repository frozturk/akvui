import { useState } from 'react';
import { Secret, KeyVault, EditModal } from '@/types';
import { EditSecretModal } from './EditSecretModal';
import { getSecretByName } from '@/app/actions';

interface SecretsTableProps {
  selectedVault: KeyVault;
  onError: (error: string) => void;
  loading: boolean;
  secrets: Secret[];
  onSecretsChange: () => void;
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

export function SecretsTable({
  selectedVault,
  onError,
  loading,
  secrets,
  onSecretsChange
}: SecretsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editModal, setEditModal] = useState<EditModal>({ isOpen: false, secret: null });

  const startEditing = async (name: string) => {
    try {
      const data = await getSecretByName(selectedVault.value, name);
      setEditModal({
        isOpen: true,
        secret: {
          name: data.name,
          value: data.value || '',
          enabled: data.enabled ?? false
        }
      });
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const filteredSecrets = secrets.filter(secret =>
    secret.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="rounded-lg shadow overflow-hidden bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-sm">
            <label htmlFor="search" className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
              Search Secrets
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border rounded-md leading-5 
                  bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                  text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by secret name"
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-gray-200">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-gray-200">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-gray-200">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-gray-200">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white dark:bg-gray-800 divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredSecrets.length > 0 ? (
              filteredSecrets.map((secret) => (
                <tr key={secret.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{secret.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      secret.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {secret.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(secret.created!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(secret.updated!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => startEditing(secret.name)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || !secret.enabled}
                      title={!secret.enabled ? "Cannot edit disabled secrets" : "Edit secret"}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-400">
                  {searchQuery ? 'No secrets found matching your search' : 'No secrets available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditSecretModal
        editModal={editModal}
        onClose={() => {
          setEditModal({ isOpen: false, secret: null });
          onSecretsChange();
        }}
        onValueChange={(value) => setEditModal({
          ...editModal,
          secret: { ...editModal.secret!, value }
        })}
        selectedVault={selectedVault}
        onError={onError}
      />
    </>
  );
} 