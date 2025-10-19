import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using JWT
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export const authenticateToken = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  // Validate token
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware to check if user is document owner
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
import DocumentModel from '../models/document.js';

export const checkDocumentAccess = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    console.log(`🔐 [checkDocumentAccess] Checking access for user ${userId} to document ${documentId}`);
    
    // Get document
    const document = await DocumentModel.getById(documentId);
    
    console.log(`📄 [checkDocumentAccess] Document retrieved:`, {
      exists: !!document,
      id: document?.id,
      title: document?.title,
      owner: document?.user_id,
      user: userId,
      isOwner: document?.user_id === userId
    });
    
    // Check if document exists
    if (!document) {
      console.warn(`❌ [checkDocumentAccess] Document ${documentId} not found`);
      return res.status(404).json({ error: "Document not found" });
    }
    
    // Check if user is owner
    if (document.user_id === userId) {
      console.log(`✅ [checkDocumentAccess] Access granted`);
      req.document = document;
      return next();
    }
    
    // No access
    console.warn(`❌ [checkDocumentAccess] Access denied - user is not owner`);
    return res.status(403).json({ error: "You don't have permission to access this document" });
  } catch (error) {
    console.error("❌ [checkDocumentAccess] Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};