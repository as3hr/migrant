import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

const mockSetPassword = mock(() => Promise.resolve());
const mockGetPassword = mock(() => Promise.resolve("mocked_password"));
const mockDeletePassword = mock(() => Promise.resolve());

mock.module("cross-keychain", () => {
  return {
    setPassword: mockSetPassword,
    getPassword: mockGetPassword,
    deletePassword: mockDeletePassword,
  };
});

import { credentialStore } from "../src/infrastructure/security/credential_store.ts";

describe("CredentialStore", () => {
  const testKey = "test_key";
  const testValue = "test_value";

  beforeEach(() => {
    mockSetPassword.mockClear();
    mockGetPassword.mockClear();
    mockDeletePassword.mockClear();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("set", () => {
    test("should successfully set a credential", async () => {
      await credentialStore.set(testKey, testValue);
      expect(mockSetPassword).toHaveBeenCalledWith("migrant", testKey, testValue);
    });

    test("should throw an error if setPassword fails", async () => {
      const error = new Error("Set failed");
      mockSetPassword.mockImplementationOnce(() => Promise.reject(error));
      
      expect(credentialStore.set(testKey, testValue)).rejects.toThrow(error);
    });
  });

  describe("get", () => {
    test("should successfully get a credential", async () => {
      const result = await credentialStore.get(testKey);
      expect(mockGetPassword).toHaveBeenCalledWith("migrant", testKey);
      expect(result).toBe("mocked_password");
    });

    test("should throw an error if getPassword fails", async () => {
      const error = new Error("Get failed");
      mockGetPassword.mockImplementationOnce(() => Promise.reject(error));
      
      expect(credentialStore.get(testKey)).rejects.toThrow(error);
    });
  });

  describe("delete", () => {
    test("should successfully delete a credential", async () => {
      await credentialStore.delete(testKey);
      expect(mockDeletePassword).toHaveBeenCalledWith("migrant", testKey);
    });

    test("should throw an error if deletePassword fails", async () => {
      const error = new Error("Delete failed");
      mockDeletePassword.mockImplementationOnce(() => Promise.reject(error));
      
      expect(credentialStore.delete(testKey)).rejects.toThrow(error);
    });
  });
});
