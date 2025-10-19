import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize Supabase client - we'll create user-scoped clients in the routes
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("ERROR: SUPABASE_URL not found!");
}

console.log('[DocumentModel] Keys available:', {
  URL: supabaseUrl ? '✓' : '✗',
  SERVICE_KEY: supabaseServiceKey ? `✓ (${supabaseServiceKey.substring(0, 20)}...)` : '✗',
  ANON_KEY: supabaseAnonKey ? '✓' : '✗'
});

const selectedKey = supabaseServiceKey || supabaseAnonKey;
const keyType = supabaseServiceKey ? 'SERVICE' : 'ANON';

if (!selectedKey) {
  console.error('ERROR: No Supabase key found!');
}

console.log(`[DocumentModel] Using ${keyType} key for Supabase client`);

const supabase = createClient(supabaseUrl || '', selectedKey || '');

/**
 * Document model for Slate editor documents
 * 
 * Table Structure:
 * documents (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users(id) on delete cascade,
 *   title text,
 *   content jsonb not null,
 *   created_at timestamp default now(),
 *   updated_at timestamp default now()
 * )
 */
class DocumentModel {
  /**
   * Create a new document
   * @param {object} data - Document data
   * @param {string} data.title - Document title
   * @param {object} data.content - Slate editor content as JSON
   * @param {string} data.user_id - User ID of the document owner
   * @returns {Promise<object>} - The created document
   */
  static async create(data) {
    try {
      // Validate required fields
      if (!data.content) throw new Error("Document content is required");
      if (!data.user_id) throw new Error("User ID is required");
      
      console.log('💾 [DocumentModel.create] Saving document:', {
        title: data.title,
        contentType: typeof data.content,
        isArray: Array.isArray(data.content),
        contentLength: Array.isArray(data.content) ? data.content.length : 'N/A'
      });
      
      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          title: data.title || "Untitled Document",
          content: data.content,
          user_id: data.user_id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      console.log('✅ [DocumentModel.create] Document saved:', {
        id: document.id,
        title: document.title,
        contentType: typeof document.content,
        contentLength: Array.isArray(document.content) ? document.content.length : 'N/A'
      });
      
      return document;
    } catch (error) {
      console.error("❌ Error creating document:", error);
      throw error;
    }
  }
  
  /**
   * Get a document by ID
   * @param {string} id - Document ID
   * @returns {Promise<object>} - The document
   */
  static async getById(id) {
    try {
      console.log(`📖 [DocumentModel.getById] Loading document ${id}`);
      
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Ensure content is properly parsed as array
      let content = document.content;
      if (typeof content === 'string') {
        console.log('⚠️ Content was stringified, parsing...');
        content = JSON.parse(content);
      }
      if (!Array.isArray(content)) {
        console.warn('⚠️ Content is not an array, wrapping:', typeof content);
        content = Array.isArray(content) ? content : [{ type: 'paragraph', children: [{ text: '' }] }];
      }
      
      // Return document with fixed content
      const fixedDocument = { ...document, content };
      
      console.log(`📄 [DocumentModel.getById] Document loaded:`, {
        id: fixedDocument.id,
        title: fixedDocument.title,
        contentType: typeof fixedDocument.content,
        isArray: Array.isArray(fixedDocument.content),
        contentLength: Array.isArray(fixedDocument.content) ? fixedDocument.content.length : 'N/A'
      });
      
      return fixedDocument;
    } catch (error) {
      console.error(`❌ Error retrieving document ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all documents for a user
   * @param {string} userId - User ID
   * @returns {Promise<object[]>} - Array of documents
   */
  static async getAllForUser(userId) {
    try {
      // Get documents owned by the user
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      return documents;
    } catch (error) {
      console.error(`Error retrieving documents for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update a document
   * @param {string} id - Document ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} - The updated document
   */
  static async update(id, updates) {
    try {
      console.log(`✏️ [DocumentModel.update] Updating document ${id}:`, {
        title: updates.title,
        hasContent: !!updates.content,
        contentType: updates.content ? typeof updates.content : 'undefined'
      });
      
      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();
      
      const { data: document, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Ensure content is properly parsed as array
      let content = document.content;
      if (typeof content === 'string') {
        console.log('⚠️ Updated content was stringified, parsing...');
        content = JSON.parse(content);
      }
      if (!Array.isArray(content)) {
        console.warn('⚠️ Updated content is not an array, wrapping:', typeof content);
        content = Array.isArray(content) ? content : [{ type: 'paragraph', children: [{ text: '' }] }];
      }
      
      const fixedDocument = { ...document, content };
      
      console.log(`📝 [DocumentModel.update] Document updated:`, {
        id: fixedDocument.id,
        title: fixedDocument.title,
        contentType: typeof fixedDocument.content,
        isArray: Array.isArray(fixedDocument.content),
        contentLength: Array.isArray(fixedDocument.content) ? fixedDocument.content.length : 'N/A'
      });
      
      return fixedDocument;
    } catch (error) {
      console.error(`❌ Error updating document ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a document
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
}

export default DocumentModel;