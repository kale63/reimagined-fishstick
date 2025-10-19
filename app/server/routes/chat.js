import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import ChatMessageModel from '../models/chatMessage.js';

const router = express.Router();

/**
 * Get chat messages for a document
 * GET /api/chat/:documentId
 */
router.get('/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { limit } = req.query;
    
    const messages = await ChatMessageModel.getByDocument(
      documentId, 
      limit ? parseInt(limit) : 50
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ error: 'Failed to retrieve chat messages' });
  }
});

/**
 * Send a chat message
 * POST /api/chat/:documentId
 */
router.post('/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const chatMessage = await ChatMessageModel.save({
      userId: req.user.userId,
      documentId,
      message
    });
    
    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;