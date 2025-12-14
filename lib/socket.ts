import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api';
const WS_URL = API_BASE_URL.replace('/api', '').replace('https://', 'wss://').replace('http://', 'ws://');

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    // Determine WebSocket URL
    // For local development, use http://localhost:3001
    // For production, extract base URL from API_BASE_URL
    let url: string;
    if (typeof window !== 'undefined') {
      // Client-side: use current origin or API URL
      if (process.env.NEXT_PUBLIC_API_URL) {
        url = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
      } else {
        url = 'http://localhost:3001';
      }
    } else {
      url = 'http://localhost:3001';
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO] Connected to server', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error.message);
      this.isConnected = false;
    });
    
    // Debug: Log all events
    this.socket.onAny((event, ...args) => {
      console.log('[Socket.IO] Event received:', event, args);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToJob(jobId: string, callbacks: {
    onLog?: (log: any) => void;
    onLogs?: (logs: any[]) => void;
    onStatus?: (status: string, result: any) => void;
  }) {
    if (!this.socket) {
      console.log('[Socket.IO] Initializing connection before subscribing to job:', jobId);
      this.connect();
    }
    
    // Wait for connection or subscribe immediately if already connected
    const trySubscribe = () => {
      if (this.socket?.connected) {
        this.doSubscribe(jobId, callbacks);
      } else {
        // Wait for connection
        const checkConnection = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkConnection);
            this.doSubscribe(jobId, callbacks);
          } else if (!this.socket) {
            clearInterval(checkConnection);
            console.error('[Socket.IO] Socket connection failed');
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          if (this.socket?.connected) {
            this.doSubscribe(jobId, callbacks);
          } else {
            console.error('[Socket.IO] Connection timeout, subscribing anyway');
            this.doSubscribe(jobId, callbacks);
          }
        }, 5000);
      }
    };
    
    // If already connected, subscribe immediately
    if (this.socket?.connected) {
      trySubscribe();
    } else {
      // Wait for connect event
      if (this.socket) {
        this.socket.once('connect', () => {
          console.log('[Socket.IO] Connected, now subscribing to job:', jobId);
          trySubscribe();
        });
      } else {
        // Socket not created yet, wait a bit
        setTimeout(trySubscribe, 500);
      }
    }
  }
  
  private doSubscribe(jobId: string, callbacks: {
    onLog?: (log: any) => void;
    onLogs?: (logs: any[]) => void;
    onStatus?: (status: string, result: any) => void;
  }) {
    if (!this.socket) {
      console.error('[Socket.IO] Cannot subscribe: socket not initialized');
      return;
    }

    console.log('[Socket.IO] Subscribing to job:', jobId, 'Socket connected:', this.socket.connected);
    
    // Join the job room
    this.socket.emit('subscribe:job', jobId);

    // Listen for individual log updates
    if (callbacks.onLog) {
      const logHandler = (data: { jobId: string; log: any }) => {
        console.log('[Socket.IO] Received log for job:', data.jobId, data.log);
        if (data.jobId === jobId) {
          callbacks.onLog!(data.log);
        }
      };
      this.socket.on('job:log', logHandler);
    }

    // Listen for bulk log updates
    if (callbacks.onLogs) {
      const logsHandler = (data: { jobId: string; logs: any[] }) => {
        console.log('[Socket.IO] Received logs for job:', data.jobId, data.logs.length, 'logs');
        if (data.jobId === jobId) {
          callbacks.onLogs!(data.logs);
        }
      };
      this.socket.on('job:logs', logsHandler);
    }

    // Listen for status updates
    if (callbacks.onStatus) {
      const statusHandler = (data: { jobId: string; status: string; result: any }) => {
        console.log('[Socket.IO] Received status for job:', data.jobId, data.status, data);
        if (data.jobId === jobId) {
          // Pass jobId in result for unsubscribe
          callbacks.onStatus!(data.status, { ...data.result, jobId: data.jobId });
        }
      };
      this.socket.on('job:status', statusHandler);
    }
  }

  unsubscribeFromJob(jobId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe:job', jobId);
      // Remove listeners for this job
      this.socket.off('job:log');
      this.socket.off('job:logs');
      this.socket.off('job:status');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

export const socketService = new SocketService();

