export interface Secret {
  name: string;
  enabled: boolean;
  created?: string;
  updated?: string;
  value?: string;
}

export interface KeyVault {
  id: string;
  name: string;
  value: string;
}

export interface EditModal {
  isOpen: boolean;
  secret: { name: string; value: string; enabled: boolean } | null;
}

export interface KeyVaultModal {
  isOpen: boolean;
  vault: KeyVault | null;
} 