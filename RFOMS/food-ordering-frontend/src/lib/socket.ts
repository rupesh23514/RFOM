import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
};

/**
 * Hook to subscribe to a Socket.IO event and call a callback when it fires.
 * Automatically joins user/restaurant rooms based on provided IDs.
 */
export const useSocketEvent = (
  eventName: string,
  callback: (data: any) => void,
  options?: { userId?: string; restaurantId?: string }
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const s = getSocket();

    // Join rooms if specified
    if (options?.userId) {
      s.emit("join-user", options.userId);
    }
    if (options?.restaurantId) {
      s.emit("join-restaurant", options.restaurantId);
    }

    const handler = (data: any) => {
      callbackRef.current(data);
    };

    s.on(eventName, handler);

    return () => {
      s.off(eventName, handler);
    };
  }, [eventName, options?.userId, options?.restaurantId]);
};
