import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

let socket = null;

export const useSocket = (onNotification) => {
  const { user } = useAuth();
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  const connect = useCallback(() => {
    if (!user || socket?.connected) return;

    socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      socket.emit('join', user.uid);
    });

    socket.on('notification:new', (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });
  }, [user]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      // Don't disconnect on unmount — keep socket alive across pages
    };
  }, [user, connect, disconnect]);

  return { socket, connect, disconnect, emit };
};
