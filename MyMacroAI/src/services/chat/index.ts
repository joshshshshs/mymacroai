/**
 * Chat Module - Export all chat-related services
 */

export { getDatabase, closeDatabase, resetDatabase } from './ChatDatabase';
export { ChatService, type ChatMessage, type MessageRole, type MessageInput } from './ChatService';
export { ChatContextBuilder, type PromptPayload } from './ChatContextBuilder';
