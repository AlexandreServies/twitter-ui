import {ApiKeyEntry} from "./types";

const STORAGE_KEY = "twitter-api-keys";

export function getStoredApiKeys(): ApiKeyEntry[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveApiKeys(keys: ApiKeyEntry[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function generateId(): string {
    return crypto.randomUUID();
}

export function formatKeyLabel(key: string, customLabel?: string): string {
    if (customLabel) return customLabel;
    if (key.length <= 4) return key;
    return `•••• ${key.slice(-4)}`;
}
