import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { Descendant } from 'slate';

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Define types for our document API
export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: Descendant[];
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  title: string;
  content: Descendant[];
}

export interface UpdateDocumentInput {
  title?: string;
  content?: Descendant[];
}

// Setup axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * API service for document operations
 */
export const DocumentService = {
  /**
   * Get all documents for the current user
   * @returns {Promise<Document[]>} - List of documents
   */
  getAllDocuments: async (): Promise<Document[]> => {
    const response = await api.get<Document[]>('/documents');
    return response.data;
  },

  /**
   * Get a specific document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Document>} - Document data
   */
  getDocumentById: async (id: string): Promise<Document> => {
    console.log('📥 API: Fetching document', id);
    const response = await api.get<Document>(`/documents/${id}`);
    console.log('📦 API: Document received:', {
      id: response.data.id,
      title: response.data.title,
      hasContent: !!response.data.content,
      contentLength: Array.isArray(response.data.content) ? response.data.content.length : 'not-array'
    });
    return response.data;
  },

  /**
   * Create a new document
   * @param {CreateDocumentInput} documentData - Document data
   * @returns {Promise<Document>} - Created document
   */
  createDocument: async (documentData: CreateDocumentInput): Promise<Document> => {
    const response = await api.post<Document>('/documents', documentData);
    return response.data;
  },

  /**
   * Update an existing document
   * @param {string} id - Document ID
   * @param {UpdateDocumentInput} documentData - Document data to update
   * @returns {Promise<Document>} - Updated document
   */
  updateDocument: async (id: string, documentData: UpdateDocumentInput): Promise<Document> => {
    const response = await api.put<Document>(`/documents/${id}`, documentData);
    return response.data;
  },

  /**
   * Delete a document
   * @param {string} id - Document ID
   * @returns {Promise<{message: string}>} - Response message
   */
  deleteDocument: async (id: string): Promise<{message: string}> => {
    const response = await api.delete<{message: string}>(`/documents/${id}`);
    return response.data;
  },
};

export default api;