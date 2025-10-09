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
export const checkDocumentAccess = async (req, res, next) => {
  try {
    // Document model will be imported in routes
    const DocumentModel = req.app.get('DocumentModel');
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    // Get document
    const document = await DocumentModel.getById(documentId);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    // Check if user is owner
    if (document.user_id === userId) {
      req.document = document;
      return next();
    }
    
    // No access
    return res.status(403).json({ error: "You don't have permission to access this document" });
  } catch (error) {
    console.error("Error checking document access:", error);
    return res.status(500).json({ error: "Server error" });
  }
};