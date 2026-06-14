import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isNative = Platform.OS !== "web";

function createStorage(secure: boolean) {
  const useSecureStore = secure && isNative;

  return {
    getItem(key: string): string | null {
      if (useSecureStore) {
        return SecureStore.getItem(key);
      }
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
      return null;
    },

    setItem(key: string, value: string) {
      if (useSecureStore) {
        SecureStore.setItem(key, value);
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    },

    removeItem(key: string) {
      if (useSecureStore) {
        SecureStore.deleteItemAsync(key);
      } else if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    },

    async getItemAsync(key: string): Promise<string | null> {
      if (useSecureStore) {
        return SecureStore.getItemAsync(key);
      }
      return AsyncStorage.getItem(key);
    },

    async setItemAsync(key: string, value: string): Promise<void> {
      if (useSecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    },

    async deleteItemAsync(key: string): Promise<void> {
      if (useSecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    },
  };
}

/** For secrets (auth tokens, credentials) — SecureStore on native, AsyncStorage on web */
export const secureStorage = createStorage(true);

/** For non-sensitive data (preferences, UI state) — AsyncStorage everywhere */
export const storage = createStorage(false);
