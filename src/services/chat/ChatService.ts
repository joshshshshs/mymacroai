/**
 * ChatService - Core chat operations with AsyncStorage
 * Handles CRUD operations and simple text search for mini-RAG
 */

import {
    getAllMessages,
    addMessage as dbAddMessage,
    updateMessage,
    deleteMessage as dbDeleteMessage,
    clearAllMessages as dbClearAllMessages,
    StoredMessage,
} from './ChatDatabase';
import * as Crypto from 'expo-crypto';

// ============================================================================
// Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    id: string;
    session_id: string;
    role: MessageRole;
    content: string;
    is_pinned: boolean;
    timestamp: string;
}

export interface MessageInput {
    content: string;
    role: MessageRole;
    sessionId?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a unique message ID
 */
function generateId(): string {
    return Crypto.randomUUID();
}

/**
 * Get today's session ID (YYYY-MM-DD format)
 */
function getTodaySessionId(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Convert StoredMessage to ChatMessage
 */
function toMessage(stored: StoredMessage): ChatMessage {
    return {
        id: stored.id,
        session_id: stored.session_id,
        role: stored.role as MessageRole,
        content: stored.content,
        is_pinned: stored.is_pinned,
        timestamp: stored.timestamp,
    };
}

// ============================================================================
// Service Class
// ============================================================================

class ChatServiceClass {
    /**
     * Add a new message to the database
     */
    async addMessage(input: MessageInput): Promise<ChatMessage> {
        const id = generateId();
        const sessionId = input.sessionId || getTodaySessionId();
        const timestamp = new Date().toISOString();

        const message: StoredMessage = {
            id,
            session_id: sessionId,
            role: input.role,
            content: input.content,
            is_pinned: false,
            timestamp,
        };

        await dbAddMessage(message);

        return toMessage(message);
    }

    /**
     * Get recent messages for API context (default: last 10)
     */
    async getRecentContext(limit: number = 10): Promise<ChatMessage[]> {
        const allMessages = await getAllMessages();
        const filtered = allMessages.filter(m => m.role !== 'system');

        // Get last N messages in chronological order
        return filtered.slice(-limit).map(toMessage);
    }

    /**
     * Get messages by session (for UI display)
     */
    async getMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
        const allMessages = await getAllMessages();
        return allMessages
            .filter(m => m.session_id === sessionId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(toMessage);
    }

    /**
     * Get messages with pagination (for infinite scroll)
     * Returns messages older than the given timestamp
     */
    async getMessagesPage(
        beforeTimestamp?: string,
        limit: number = 50
    ): Promise<ChatMessage[]> {
        const allMessages = await getAllMessages();

        let filtered = allMessages;
        if (beforeTimestamp) {
            const beforeTime = new Date(beforeTimestamp).getTime();
            filtered = allMessages.filter(m => new Date(m.timestamp).getTime() < beforeTime);
        }

        // Sort by timestamp descending, take limit, then reverse for chronological order
        return filtered
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit)
            .reverse()
            .map(toMessage);
    }

    /**
     * Search chat history using simple text matching
     * Returns messages matching the query
     */
    async searchHistory(query: string, limit: number = 5): Promise<ChatMessage[]> {
        if (!query.trim()) return [];

        const allMessages = await getAllMessages();
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

        if (searchTerms.length === 0) return [];

        // Score each message based on how many search terms it contains
        const scored = allMessages.map(msg => {
            const content = msg.content.toLowerCase();
            const matchCount = searchTerms.filter(term => content.includes(term)).length;
            return { message: msg, score: matchCount };
        });

        // Filter messages with at least one match, sort by score and recency
        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => {
                // Sort by score first, then by timestamp
                if (b.score !== a.score) return b.score - a.score;
                return new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime();
            })
            .slice(0, limit)
            .map(item => toMessage(item.message));
    }

    /**
     * Pin/unpin a message (save as insight)
     */
    async pinMessage(id: string, pinned: boolean = true): Promise<void> {
        await updateMessage(id, { is_pinned: pinned });
    }

    /**
     * Get all pinned messages
     */
    async getPinnedMessages(): Promise<ChatMessage[]> {
        const allMessages = await getAllMessages();
        return allMessages
            .filter(m => m.is_pinned)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map(toMessage);
    }

    /**
     * Delete a message
     */
    async deleteMessage(id: string): Promise<void> {
        await dbDeleteMessage(id);
    }

    /**
     * Get distinct session IDs (for grouping by date)
     */
    async getSessionIds(limit: number = 30): Promise<string[]> {
        const allMessages = await getAllMessages();
        const sessionSet = new Set<string>();

        // Iterate in reverse to get most recent sessions first
        for (let i = allMessages.length - 1; i >= 0 && sessionSet.size < limit; i--) {
            sessionSet.add(allMessages[i].session_id);
        }

        return Array.from(sessionSet);
    }

    /**
     * Get message count
     */
    async getMessageCount(): Promise<number> {
        const allMessages = await getAllMessages();
        return allMessages.length;
    }

    /**
     * Clear all messages (for testing/reset)
     */
    async clearAllMessages(): Promise<void> {
        await dbClearAllMessages();
    }
}

// Export singleton instance
export const ChatService = new ChatServiceClass();
