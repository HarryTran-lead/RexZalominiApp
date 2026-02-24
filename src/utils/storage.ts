import { getStorage, setStorage, removeStorage } from "zmp-sdk";
import { STORAGE_KEYS } from "../api/api";

/**
 * Storage utility for Zalo Mini App
 * Provides helper functions to work with Zalo storage API
 */

export const storage = {
  /**
   * Get a single item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const result = await getStorage({ keys: [key] });
      return result[key] || null;
    } catch (error) {
      console.error(`Error getting storage key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set a single item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await setStorage({
        data: {
          [key]: value,
        },
      });
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Remove a single item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await removeStorage({ keys: [key] });
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Get multiple items from storage
   */
  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    try {
      return await getStorage({ keys });
    } catch (error) {
      console.error("Error getting multiple storage keys:", error);
      return {};
    }
  },

  /**
   * Set multiple items in storage
   */
  async setMultiple(data: Record<string, any>): Promise<void> {
    try {
      await setStorage({ data });
    } catch (error) {
      console.error("Error setting multiple storage keys:", error);
      throw error;
    }
  },

  /**
   * Remove multiple items from storage
   */
  async removeMultiple(keys: string[]): Promise<void> {
    try {
      await removeStorage({ keys });
    } catch (error) {
      console.error("Error removing multiple storage keys:", error);
      throw error;
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Set access token
   */
  async setAccessToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Set refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Get user data
   */
  async getUser<T = any>(): Promise<T | null> {
    const userStr = await this.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Set user data
   */
  async setUser(user: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Clear all auth data
   */
  async clearAuth(): Promise<void> {
    return this.removeMultiple([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  },
};
