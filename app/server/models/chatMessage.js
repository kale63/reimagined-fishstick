import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("ERROR: SUPABASE_URL not found!");
}

console.log('[ChatMessageModel] Keys available:', {
  URL: supabaseUrl ? '✓' : '✗',
  SERVICE_KEY: supabaseServiceKey ? `✓ (${supabaseServiceKey.substring(0, 20)}...)` : '✗',
  ANON_KEY: supabaseAnonKey ? '✓' : '✗'
});

const selectedKey = supabaseServiceKey || supabaseAnonKey;
const keyType = supabaseServiceKey ? 'SERVICE' : 'ANON';

if (!selectedKey) {
  console.error('ERROR: No Supabase key found!');
}

console.log(`[ChatMessageModel] Using ${keyType} key for Supabase client`);

const supabase = createClient(supabaseUrl || '', selectedKey || '');

/**
 * Message model for chat messages
 * 
 * Assumes you have a chat_messages table in Supabase with structure:
 * chat_messages (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users(id) on delete cascade,
 *   document_id uuid references documents(id) on delete cascade,
 *   message text not null,
 *   created_at timestamp default now()
 * )
 */
class ChatMessageModel {
  /**
   * Save a message to the database
   * @param {object} data - Message data
   * @param {string} data.userId - User ID who sent the message
   * @param {string} data.documentId - Document ID the message belongs to
   * @param {string} data.message - Message content
   * @returns {Promise<object>} - The saved message
   */
  static async save(data) {
    try {
      // Validate required fields
      if (!data.userId) throw new Error("User ID is required");
      if (!data.documentId) throw new Error("Document ID is required");
      if (!data.message) throw new Error("Message content is required");
      
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: data.userId,
          document_id: data.documentId,
          message: data.message
        })
        .select()
        .single();
        
      if (error) throw error;
      return message;
    } catch (error) {
      console.error("Error saving chat message:", error);
      throw error;
    }
  }
  
  /**
   * Get chat messages for a document
   * @param {string} documentId - Document ID
   * @param {number} limit - Number of messages to return (default 50)
   * @returns {Promise<object[]>} - Array of messages
   */
  static async getByDocument(documentId, limit = 50) {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          id, 
          message, 
          created_at, 
          user_id,
          auth.users!chat_messages_user_id_fkey(email)
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      // Format messages
      return messages.map(msg => ({
        id: msg.id,
        userId: msg.user_id,
        userName: msg.auth?.users?.email || 'Unknown User',
        message: msg.message,
        timestamp: msg.created_at
      })).reverse();
    } catch (error) {
      console.error(`Error retrieving chat messages for document ${documentId}:`, error);
      throw error;
    }
  }
}

export default ChatMessageModel;