/**
 * ChatDatabase - AsyncStorage-based chat storage
 * Replaces SQLite for Expo Go compatibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
    MESSAGES: '@mymacro_chat_messages',
    PINNED_IDS: '@mymacro_chat_pinned',
};

// ============================================================================
// Types
// ============================================================================

export interface StoredMessage {
    id: string;
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    is_pinned: boolean;
    timestamp: string;
}

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Get all messages from storage
 */
export async function getAllMessages(): Promise<StoredMessage[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn('Failed to get messages:', error);
        return [];
    }
}

/**
 * Save all messages to storage
 */
export async function saveAllMessages(messages: StoredMessage[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
        console.warn('Failed to save messages:', error);
    }
}

/**
 * Add a single message
 */
export async function addMessage(message: StoredMessage): Promise<void> {
    const messages = await getAllMessages();
    messages.push(message);

    // Keep only last 500 messages to prevent storage bloat
    const trimmedMessages = messages.slice(-500);
    await saveAllMessages(trimmedMessages);
}

/**
 * Update a message by ID
 */
export async function updateMessage(id: string, updates: Partial<StoredMessage>): Promise<void> {
    const messages = await getAllMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
        messages[index] = { ...messages[index], ...updates };
        await saveAllMessages(messages);
    }
}

/**
 * Delete a message by ID
 */
export async function deleteMessage(id: string): Promise<void> {
    const messages = await getAllMessages();
    const filtered = messages.filter(m => m.id !== id);
    await saveAllMessages(filtered);
}

/**
 * Clear all messages
 */
export async function clearAllMessages(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
}

/**
 * Reset the database (for development/testing)
 */
export async function resetDatabase(): Promise<void> {
    await clearAllMessages();
}

// ============================================================================
// Compatibility Layer (for existing code)
// ============================================================================

// These functions maintain API compatibility with the old SQLite-based code

/**
 * Get database - no-op for AsyncStorage (kept for API compatibility)
 */
export async function getDatabase(): Promise<null> {
    return null;
}

/**
 * Close database - no-op for AsyncStorage (kept for API compatibility)
 */
export async function closeDatabase(): Promise<void> {
    // No-op - AsyncStorage doesn't need closing
}
