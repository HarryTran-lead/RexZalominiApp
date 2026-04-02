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
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(key);
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
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
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
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
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
      if (typeof window === "undefined") return {};
      return keys.reduce<Record<string, any>>((acc, key) => {
        acc[key] = window.localStorage.getItem(key);
        return acc;
      }, {});
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
      if (typeof window === "undefined") return;
      Object.entries(data).forEach(([key, value]) => {
        window.localStorage.setItem(key, String(value));
      });
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
      if (typeof window === "undefined") return;
      keys.forEach((key) => window.localStorage.removeItem(key));
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
