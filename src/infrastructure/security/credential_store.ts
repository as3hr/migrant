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
    try {
      await setPassword(SERVICE, key, value);
    }
    catch (error) {
      console.error("Error setting credential:", error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await getPassword(SERVICE, key);
    }
    catch (error) {
      console.error("Error getting credential:", error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try { 
      await deletePassword(SERVICE, key);
    }
    catch (error) {
      console.error("Error setting credential:", error);
    }
  }
}

export const credentialStore = new CredentialStore();