'use server';

import { listSecrets, setSecret, getSecret } from "@/lib/azure-keyvault";
import { revalidatePath } from "next/cache";

export async function getSecretsList(vault: string) {
  return await listSecrets(vault);
}

export async function getSecretByName(vault: string, name: string) {
  return await getSecret(vault, name);
}

export async function createOrUpdateSecret(vault: string, name: string, value: string) {
  const result = await setSecret(vault, name, value);
  revalidatePath('/');
  return result;
} 