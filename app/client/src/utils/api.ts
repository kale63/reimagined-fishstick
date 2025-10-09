import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { Descendant } from 'slate';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
   * @returns {Promise<Document[]>} 
   */
  getAllDocuments: async (): Promise<Document[]> => {
    const response = await api.get<Document[]>('/documents');
    return response.data;
  },

  /**
   * Get a specific document by ID
   * @param {string} id 
   * @returns {Promise<Document>} 
   */
  getDocumentById: async (id: string): Promise<Document> => {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  /**
   * Create a new document
   * @param {CreateDocumentInput} documentData
   * @returns {Promise<Document>} 
   */
  createDocument: async (documentData: CreateDocumentInput): Promise<Document> => {
    const response = await api.post<Document>('/documents', documentData);
    return response.data;
  },

  /**
   * Update an existing document
   * @param {string} id
   * @param {UpdateDocumentInput} documentData
   * @returns {Promise<Document>} 
   */
  updateDocument: async (id: string, documentData: UpdateDocumentInput): Promise<Document> => {
    const response = await api.put<Document>(`/documents/${id}`, documentData);
    return response.data;
  },

  /**
   * Delete a document
   * @param {string} id 
   * @returns {Promise<{message: string}>}
   */
  deleteDocument: async (id: string): Promise<{message: string}> => {
    const response = await api.delete<{message: string}>(`/documents/${id}`);
    return response.data;
  },
};

export default api;