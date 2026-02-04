/**
 * useJournal - Persist and manage journal entries
 * Uses AsyncStorage for local persistence
 */

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mymacro/journal_entries';

export interface JournalEntry {
    id: string;
    date: string; // ISO date string
    text: string;
    mood: number | null; // Index into MOODS array
    dayRating: number; // 1-5 stars
    shareWithAI: boolean;
    createdAt: string;
    updatedAt: string;
}

interface JournalState {
    entries: JournalEntry[];
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    loadEntries: () => Promise<void>;
    saveEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntry>;
    updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    getEntryByDate: (date: string) => JournalEntry | undefined;
}

const useJournalStore = create<JournalState>((set, get) => ({
    entries: [],
    isLoading: true,
    isInitialized: false,

    loadEntries: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as JournalEntry[];
                // Sort by date, newest first
                parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                set({ entries: parsed, isLoading: false, isInitialized: true });
            } else {
                set({ isLoading: false, isInitialized: true });
            }
        } catch (error) {
            if (__DEV__) console.warn('Failed to load journal entries:', error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    saveEntry: async (entryData) => {
        const { entries } = get();
        const now = new Date().toISOString();

        // Check if entry for this date already exists
        const existingIndex = entries.findIndex(e => e.date === entryData.date);

        let newEntry: JournalEntry;
        let newEntries: JournalEntry[];

        if (existingIndex >= 0) {
            // Update existing entry
            newEntry = {
                ...entries[existingIndex],
                ...entryData,
                updatedAt: now,
            };
            newEntries = [...entries];
            newEntries[existingIndex] = newEntry;
        } else {
            // Create new entry
            newEntry = {
                id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...entryData,
                createdAt: now,
                updatedAt: now,
            };
            newEntries = [newEntry, ...entries];
        }

        // Sort by date, newest first
        newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
            set({ entries: newEntries });
            return newEntry;
        } catch (error) {
            if (__DEV__) console.error('Failed to save journal entry:', error);
            throw error;
        }
    },

    updateEntry: async (id, updates) => {
        const { entries } = get();
        const index = entries.findIndex(e => e.id === id);
        if (index === -1) return;

        const newEntries = [...entries];
        newEntries[index] = {
            ...newEntries[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
            set({ entries: newEntries });
        } catch (error) {
            if (__DEV__) console.error('Failed to update journal entry:', error);
        }
    },

    deleteEntry: async (id) => {
        const { entries } = get();
        const newEntries = entries.filter(e => e.id !== id);

        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
            set({ entries: newEntries });
        } catch (error) {
            if (__DEV__) console.error('Failed to delete journal entry:', error);
        }
    },

    getEntryByDate: (date) => {
        const { entries } = get();
        return entries.find(e => e.date === date);
    },
}));

export function useJournal() {
    const {
        entries,
        isLoading,
        isInitialized,
        loadEntries,
        saveEntry,
        updateEntry,
        deleteEntry,
        getEntryByDate,
    } = useJournalStore();

    // Load entries on first mount
    useEffect(() => {
        if (!isInitialized) {
            loadEntries();
        }
    }, [isInitialized, loadEntries]);

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = useCallback(() => {
        return new Date().toISOString().split('T')[0];
    }, []);

    // Get today's entry if it exists
    const todayEntry = getEntryByDate(getTodayDate());

    // Get entries for the last N days
    const getRecentEntries = useCallback((days: number = 7) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return entries.filter(e => new Date(e.date) >= cutoffDate);
    }, [entries]);

    return {
        entries,
        isLoading,
        todayEntry,
        saveEntry,
        updateEntry,
        deleteEntry,
        getEntryByDate,
        getRecentEntries,
        getTodayDate,
    };
}
