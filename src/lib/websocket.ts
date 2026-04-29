import { WsMessage } from "@/types";

export function broadcast(message: WsMessage) {
  if (!global.wsClients || global.wsClients.size === 0) return;
  const payload = JSON.stringify(message);
  for (const client of global.wsClients) {
    try {
      if (client.readyState === 1) {
        client.send(payload);
      }
    } catch (err) {
      console.error("[WS] Broadcast error:", err);
    }
  }
}
