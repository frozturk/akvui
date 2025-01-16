'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { AddSecretForm } from '@/components/AddSecretForm';
import { SecretsTable } from '@/components/SecretsTable';
import { AddKeyVaultModal } from '@/components/AddKeyVaultModal';
import { KeyVault, KeyVaultModal, Secret } from '@/types';
import { getSecretsList } from './actions';

export default function Home() {
  const [error, setError] = useState('');
  const [keyVaults, setKeyVaults] = useState<KeyVault[]>([]);
  const [selectedVault, setSelectedVault] = useState<KeyVault | null>(null);
  const [keyVaultModal, setKeyVaultModal] = useState<KeyVaultModal>({ isOpen: false, vault: null });
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSecrets = useCallback(async () => {
    if (!selectedVault) {
      setSecrets([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getSecretsList(selectedVault.value);
      setSecrets(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedVault, setSecrets, setLoading, setError]);

  useEffect(() => {
    const savedKeyVaults = localStorage.getItem('keyVaults');
    const initialKeyVaults = savedKeyVaults ? JSON.parse(savedKeyVaults) : [];
    setKeyVaults(initialKeyVaults);
    setSelectedVault(initialKeyVaults[0] || null);
  }, []);

  useEffect(() => {
    if (keyVaults.length > 0) {
      localStorage.setItem('keyVaults', JSON.stringify(keyVaults));
    }
  }, [keyVaults]);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const addKeyVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyVaultModal.vault) return;

    const newVault = {
      id: keyVaultModal.vault.id.toLowerCase(),
      name: keyVaultModal.vault.name,
      value: keyVaultModal.vault.value
    };

    setKeyVaults([...keyVaults, newVault]);
    if (!selectedVault) {
      setSelectedVault(newVault);
    }
    setKeyVaultModal({ isOpen: false, vault: null });
  };

  const deleteKeyVault = (vaultId: string) => {
    if (window.confirm('Are you sure you want to remove this Key Vault? This action cannot be undone.')) {
      const newVaults = keyVaults.filter(v => v.id !== vaultId);
      setKeyVaults(newVaults);
      if (selectedVault?.id === vaultId) {
        setSelectedVault(newVaults[0] || null);
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <Header
          selectedVault={selectedVault}
          keyVaults={keyVaults}
          loading={loading}
          onVaultSelect={setSelectedVault}
          onAddVault={() => setKeyVaultModal({ isOpen: true, vault: { id: '', name: '', value: '' } })}
          onDeleteVault={deleteKeyVault}
        />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!selectedVault ? (
          <div className="rounded-lg shadow p-6 text-center bg-white dark:bg-gray-800">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Please add a Key Vault using the &quot;+&quot; button to start managing secrets.
            </p>
          </div>
        ) : (
          <>
            <AddSecretForm
              selectedVault={selectedVault}
              onError={setError}
              onSecretAdded={() => {
                setError('');
                fetchSecrets();
              }}
            />

            <SecretsTable
              selectedVault={selectedVault}
              onError={setError}
              loading={loading}
              secrets={secrets}
              onSecretsChange={fetchSecrets}
            />
          </>
        )}

        <AddKeyVaultModal
          keyVaultModal={keyVaultModal}
          onClose={() => setKeyVaultModal({ isOpen: false, vault: null })}
          onSubmit={addKeyVault}
          onVaultChange={(name, value) => setKeyVaultModal({
            ...keyVaultModal,
            vault: {
              ...keyVaultModal.vault!,
              name,
              id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              value
            }
          })}
        />
      </div>
    </div>
  );
}
