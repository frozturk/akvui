import { KeyVaultModal } from '@/types';

interface AddKeyVaultModalProps {
  keyVaultModal: KeyVaultModal;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onVaultChange: (name: string, value: string) => void;
}

export function AddKeyVaultModal({
  keyVaultModal,
  onClose,
  onSubmit,
  onVaultChange
}: AddKeyVaultModalProps) {
  if (!keyVaultModal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="rounded-lg p-8 max-w-md w-full shadow-xl bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Key Vault</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Display Name</label>
            <input
              type="text"
              value={keyVaultModal.vault?.name || ''}
              onChange={(e) => onVaultChange(e.target.value, keyVaultModal.vault?.value || '')}
              className="mt-1 block w-full rounded-md shadow-sm font-medium
                bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                text-gray-900 dark:text-gray-200 focus:border-indigo-500
                focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Vault URL</label>
            <input
              type="text"
              value={keyVaultModal.vault?.value || ''}
              onChange={(e) => onVaultChange(keyVaultModal.vault?.name || '', e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm font-medium
                bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                text-gray-900 dark:text-gray-200 focus:border-indigo-500
                focus:ring-indigo-500"
              required
              placeholder="e.g., my-keyvault-name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border rounded-md shadow-sm 
                text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 
                border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                border border-transparent rounded-md shadow-sm hover:bg-indigo-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Key Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 