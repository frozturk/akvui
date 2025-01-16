import { EditModal, KeyVault } from '@/types';
import { createOrUpdateSecret } from '@/app/actions';

interface EditSecretModalProps {
  editModal: EditModal;
  onClose: () => void;
  onValueChange: (value: string) => void;
  selectedVault: KeyVault
  onError: (error: string) => void;
}

export function EditSecretModal({
  editModal,
  onClose,
  onValueChange,
  selectedVault,
  onError
}: EditSecretModalProps) {
  if (!editModal.isOpen || !editModal.secret) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.secret) return;

    if (!window.confirm(`Are you sure you want to update the secret "${editModal.secret.name}" in key vault "${selectedVault.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await createOrUpdateSecret(selectedVault.value, editModal.secret.name, editModal.secret.value);
      onClose();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="rounded-lg p-8 max-w-md w-full shadow-xl bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Secret</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Secret Name</label>
            <input
              type="text"
              value={editModal.secret.name}
              className="mt-1 block w-full rounded-md shadow-sm
                bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                text-gray-500 dark:text-gray-300"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Secret Value</label>
            <input
              type="text"
              value={editModal.secret.value}
              onChange={(e) => onValueChange(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm font-medium
                bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                text-gray-900 dark:text-gray-200 focus:border-indigo-500
                focus:ring-indigo-500"
              required
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 