/**
 * WebSocket Service - Client Side
 *
 * Manages WebSocket connection, event subscriptions, and real-time data syncing.
 * Works for both web (React) and mobile (React Native) with platform-specific adaptations.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  WebSocketEventType,
  WebSocketMessage,
  WebSocketConnectionState,
  WebSocketErrorMessage,
} from '@diet/shared';

const WS_RECONNECT_INTERVAL = 3000; // 3 seconds
const WS_RECONNECT_MAX_ATTEMPTS = 10;
const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface WebSocketConfig {
  url: string;
  token: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig | null = null;
  private listeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map();
  private connectionState: WebSocketConnectionState = {
    sessionId: Math.random().toString(36),
    isAuthenticated: false,
    isConnected: false,
    subscriptions: [],
    reconnectAttempts: 0,
    lastHeartbeat: 0,
  };
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timer | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private requestQueue: Map<string, (data: any) => void> = new Map();

  connect(config: WebSocketConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.config = config;
        const url = new URL(config.url);
        url.searchParams.set('token', config.token);

        this.ws = new WebSocket(url.toString());

        this.ws.onopen = () => {
          this.connectionState.isConnected = true;
          this.connectionState.reconnectAttempts = 0;
          this.authenticate();
          this.startHeartbeat();
          this.flushMessageQueue();

          if (config.onConnect) config.onConnect();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          if (config.onError) config.onError(error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.connectionState.isConnected = false;
          if (config.onDisconnect) config.onDisconnect();
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private authenticate(): void {
    this.send({
      event: WebSocketEventType.AUTHENTICATE,
      data: {
        sessionId: this.connectionState.sessionId,
      },
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    const { event, data, requestId } = message;

    // Handle request responses
    if (requestId && this.requestQueue.has(requestId)) {
      const callback = this.requestQueue.get(requestId)!;
      callback(data);
      this.requestQueue.delete(requestId);
      return;
    }

    // Handle authentication
    if (event === WebSocketEventType.AUTHENTICATE) {
      this.connectionState.isAuthenticated = true;
      return;
    }

    // Handle error messages
    if (event === WebSocketEventType.ERROR || event === WebSocketEventType.UNAUTHORIZED) {
      const errorMsg = message as WebSocketErrorMessage;
      console.error('WebSocket error:', errorMsg.error);
      if (event === WebSocketEventType.UNAUTHORIZED) {
        this.disconnect();
      }
      return;
    }

    // Handle heartbeat
    if (event === WebSocketEventType.CONNECT) {
      this.connectionState.lastHeartbeat = Date.now();
      return;
    }

    // Emit to subscribers
    this.emit(event, data);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          event: WebSocketEventType.CONNECT,
          data: { ping: true },
        });
      }
    }, WS_HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.connectionState.reconnectAttempts >= WS_RECONNECT_MAX_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.connectionState.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      if (this.config) {
        console.log(
          `Attempting to reconnect... (${this.connectionState.reconnectAttempts}/${WS_RECONNECT_MAX_ATTEMPTS})`,
        );
        this.connect(this.config).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, WS_RECONNECT_INTERVAL);
  }

  send<T = any>(message: WebSocketMessage<T>): void {
    if (!this.isConnected() || !this.ws) {
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.messageQueue.push(message);
    }
  }

  subscribe(event: WebSocketEventType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: WebSocketEventType, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  subscribeRoom(room: string): void {
    if (!this.connectionState.subscriptions.includes(room)) {
      this.connectionState.subscriptions.push(room);
      this.send({
        event: WebSocketEventType.CONNECT,
        data: { subscribe: room },
      });
    }
  }

  unsubscribeRoom(room: string): void {
    this.connectionState.subscriptions = this.connectionState.subscriptions.filter((r) => r !== room);
    this.send({
      event: WebSocketEventType.DISCONNECT,
      data: { unsubscribe: room },
    });
  }

  isConnected(): boolean {
    return this.connectionState.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  isAuthenticated(): boolean {
    return this.connectionState.isAuthenticated;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionState.isConnected = false;
    this.connectionState.isAuthenticated = false;
  }

  getConnectionState(): WebSocketConnectionState {
    return { ...this.connectionState };
  }
}

// Singleton instance
export const wsService = new WebSocketService();

/**
 * React Hook for WebSocket connection
 */
export function useWebSocket(token: string, enabled = true) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef(wsService);

  useEffect(() => {
    if (!enabled || !token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

    wsRef.current.connect({
      url: wsUrl,
      token,
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
        setIsAuthenticated(false);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
    });

    return () => {
      wsRef.current.disconnect();
    };
  }, [token, enabled]);

  return {
    ws: wsRef.current,
    isConnected,
    isAuthenticated,
  };
}

/**
 * Hook for subscribing to WebSocket events
 */
export function useWebSocketEvent<T = any>(
  event: WebSocketEventType,
  callback: (data: T) => void,
) {
  useEffect(() => {
    return wsService.subscribe(event, callback);
  }, [event, callback]);
}

/**
 * Hook for real-time data updates
 */
export function useWebSocketDataSync<T>(
  queryKey: any[],
  event: WebSocketEventType,
  enabled = true,
) {
  const queryClient = useQueryClient();

  useWebSocketEvent(event, (data) => {
    if (enabled) {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        // Handle array updates
        if (Array.isArray(oldData)) {
          const updatedArray = oldData.map((item: any) =>
            item.id === data.id ? { ...item, ...data } : item,
          );
          // Add new items if not found
          if (!updatedArray.find((item: any) => item.id === data.id)) {
            updatedArray.push(data);
          }
          return updatedArray;
        }

        // Handle paginated data
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((item: any) =>
              item.id === data.id ? { ...item, ...data } : item,
            ),
          };
        }

        return oldData;
      });
    }
  });
}

/**
 * Hook for invalidating queries on WebSocket events
 */
export function useWebSocketInvalidation(
  event: WebSocketEventType,
  queryKey: any[],
  enabled = true,
) {
  const queryClient = useQueryClient();

  useWebSocketEvent(event, () => {
    if (enabled) {
      queryClient.invalidateQueries({ queryKey });
    }
  });
}
