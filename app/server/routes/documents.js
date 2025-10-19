import express from 'express';
import { authenticateToken, checkDocumentAccess } from '../middleware/auth.js';
import DocumentModel from '../models/document.js';

const router = express.Router();

/**
 * Create a new document
 * POST /api/documents
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const document = await DocumentModel.create({
      title,
      content,
      user_id: req.user.userId
    });
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get all documents for current user
 * GET /api/documents
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await DocumentModel.getAllForUser(req.user.userId);
    res.json(documents);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

/**
 * Get a document by ID
 * GET /api/documents/:id
 */
router.get('/:id', authenticateToken, checkDocumentAccess, (req, res) => {
  // Document is already attached to req by checkDocumentAccess middleware
  console.log('📄 [GET /api/documents/:id] Returning document:', {
    id: req.document?.id,
    title: req.document?.title,
    hasContent: !!req.document?.content,
    contentType: typeof req.document?.content
  });
  res.json(req.document);
});

/**
 * Update a document
 * PUT /api/documents/:id
 */
router.put('/:id', authenticateToken, checkDocumentAccess, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Only update fields that were provided
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    
    const updatedDocument = await DocumentModel.update(req.params.id, updates);
    res.json(updatedDocument);
  } catch (error) {
    console.error(`Error updating document ${req.params.id}:`, error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
router.delete('/:id', authenticateToken, checkDocumentAccess, async (req, res) => {
  try {
    await DocumentModel.delete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(`Error deleting document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;