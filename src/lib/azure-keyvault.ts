import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { Secret } from "@/types";

const credential = new DefaultAzureCredential();

function getClient(vaultName: string) {
  const vaultUrl = `https://${vaultName}.vault.azure.net`;
  return new SecretClient(vaultUrl, credential);
}

export async function listSecrets(vaultName: string): Promise<Secret[]> {
  const client = getClient(vaultName);
  const secrets: Secret[] = [];
  for await (const secretProperties of client.listPropertiesOfSecrets()) {
    secrets.push({
      name: secretProperties.name,
      enabled: secretProperties.enabled ?? false,
      created: secretProperties.createdOn?.toISOString(),
      updated: secretProperties.updatedOn?.toISOString(),
    });
  }
  return secrets;
}

export async function getSecret(vaultName: string, name: string): Promise<Secret> {
  const client = getClient(vaultName);
  const secret = await client.getSecret(name);
  return {
    name: secret.name,
    value: secret.value || '',
    enabled: secret.properties.enabled ?? false,
    created: secret.properties.createdOn?.toISOString(),
    updated: secret.properties.updatedOn?.toISOString(),
  };
}

export async function setSecret(vaultName: string, name: string, value: string): Promise<Secret> {
  const client = getClient(vaultName);
  const result = await client.setSecret(name, value);
  return {
    name: result.name,
    enabled: result.properties.enabled ?? false,
    created: result.properties.createdOn?.toISOString(),
    updated: result.properties.updatedOn?.toISOString(),
  };
} 