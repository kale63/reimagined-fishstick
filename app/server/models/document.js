import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
      return document;
    } catch (error) {
      console.error("Error creating document:", error);
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
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return document;
    } catch (error) {
      console.error(`Error retrieving document ${id}:`, error);
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
      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();
      
      const { data: document, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return document;
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
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