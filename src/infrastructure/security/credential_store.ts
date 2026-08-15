import { deletePassword, getPassword, setPassword } from "cross-keychain";
const SERVICE = "migrant";

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