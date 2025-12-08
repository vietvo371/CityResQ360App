import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebSocketService from '../services/websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  listen: (channel: string, event: string, callback: (data: any) => void) => void;
  subscribePusher: (channel: string, event: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initWebSocket = async () => {
      try {
        // Check if WebSocket is enabled
        if (!env.ENABLE_WEBSOCKET) {
          console.log('⚠️ WebSocket bị TẮT trong env.ts - Bật lại nếu backend đã config Reverb');
          return;
        }

        // Check if user is logged in (key phải giống với authService)
        const token = await AsyncStorage.getItem('@auth_token');
        if (!token) {
          console.log('⚠️ No auth token, skipping WebSocket connection');
          return;
        }

        console.log('🚀 Đang khởi tạo WebSocket connection...');

        // Connect WebSocket
        await WebSocketService.connect();
        
        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('❌ Failed to initialize WebSocket:', error);
        console.error('💡 App vẫn hoạt động bình thường, chỉ không có realtime notifications');
      }
    };

    initWebSocket();

    // Cleanup on unmount
    return () => {
      mounted = false;
      WebSocketService.disconnect();
    };
  }, []);

  const subscribe = (channel: string) => {
    WebSocketService.subscribe(channel);
  };

  const unsubscribe = (channel: string) => {
    WebSocketService.unsubscribe(channel);
  };

  const listen = (channel: string, event: string, callback: (data: any) => void) => {
    WebSocketService.listen(channel, event, callback);
  };

  const subscribePusher = (channel: string, event: string, callback: (data: any) => void) => {
    WebSocketService.subscribePusher(channel, event, callback);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, unsubscribe, listen, subscribePusher }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};
