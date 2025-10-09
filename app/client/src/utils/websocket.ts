import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  // Initialize and connect the socket
  public connect(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.connected) {
        resolve(true);
        return;
      }

      this.socket = io('http://localhost:3001', {
        auth: {
          token
        }
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected!');
        this.connected = true;
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.connected = false;
        resolve(false);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.connected = false;
      });
    });
  }

  // Disconnect the socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join a document room
  public joinDocument(documentId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('join-document', documentId);
    } else {
      console.error('Cannot join document: WebSocket not connected');
    }
  }

  // Send document changes
  public sendDocumentChange(documentId: string, changes: any): void {
    if (this.socket && this.connected) {
      this.socket.emit('document-change', {
        documentId,
        changes,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Cannot send document changes: WebSocket not connected');
    }
  }

  // Send a chat message
  public sendMessage(documentId: string, userId: string, userName: string, message: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('send-message', {
        documentId,
        userId,
        userName,
        message
      });
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }

  // Subscribe to document updates
  public onDocumentUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('document-updated', callback);
    }
  }

  // Subscribe to new messages
  public onNewMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Unsubscribe from events
  public off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Check if connected
  public isConnected(): boolean {
    return this.connected;
  }

  // Get socket instance
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;