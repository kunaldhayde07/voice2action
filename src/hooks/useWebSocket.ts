import { useEffect, useRef, useCallback, useState } from "react";
import { WsMessage } from "@/types";

interface UseWebSocketOptions {
  onMessage?: (msg: WsMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws";
    try {
      ws.current = new WebSocket(wsUrl);
      ws.current.onopen = () => {
        setIsConnected(true);
        optionsRef.current.onConnect?.();
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "ping" }));
          }
        }, 25000);
      };
      ws.current.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          if (msg.type !== "pong") optionsRef.current.onMessage?.(msg);
        } catch {}
      };
      ws.current.onclose = () => {
        setIsConnected(false);
        optionsRef.current.onDisconnect?.();
        if (pingInterval.current) clearInterval(pingInterval.current);
        reconnectTimeout.current = setTimeout(connect, 3000);
      };
      ws.current.onerror = () => ws.current?.close();
    } catch (err) {
      console.error("[WebSocket] Connection failed:", err);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (pingInterval.current) clearInterval(pingInterval.current);
      ws.current?.close();
    };
  }, [connect]);

  return { isConnected };
}
