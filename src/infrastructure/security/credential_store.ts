import { deletePassword, getPassword, setPassword } from "cross-keychain";
const SERVICE = "migrant";

const backendMap: Record<string, string> = {
  darwin: 'macos',
  win32: 'windows',
  linux: 'secret-service',
};

process.env.TS_KEYRING_BACKEND = backendMap[process.platform] ?? 'file';

export class CredentialStore {
  async set(key: string, value: string): Promise<void> {
    await setPassword(SERVICE, key, value);
  }

  async get(key: string): Promise<string | null> {
    return getPassword(SERVICE, key);
  }

  async delete(key: string): Promise<void> {
    await deletePassword(SERVICE, key);
  }
}

export const credentialStore = new CredentialStore();