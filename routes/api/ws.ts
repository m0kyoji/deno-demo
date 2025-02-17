/// <reference lib="deno.unstable" />
import { FreshContext } from "$fresh/server.ts";

interface RoomData {
  sockets: WebSocket[];
  messages: string[];
  resetTimer: number | null;
}

const rooms: Map<string, RoomData> = new Map();

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  if (req.method === "GET") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const roomId = new URL(req.url).searchParams.get("room") || "default";

    try {
      await setupWebSocket(socket, roomId);
      return response;
    } catch (error) {
      console.error("Error in WebSocket setup:", error);
      return new Response("WebSocket setup failed", { status: 500 });
    }
  } else {
    return new Response("Method Not Allowed", { status: 405 });
  }
};

async function setupWebSocket(socket: WebSocket, roomId: string): Promise<void> {
  const room = await getOrCreateRoom(roomId);

  socket.onopen = () => handleSocketOpen(socket, room, roomId);
  socket.onmessage = (event) => handleSocketMessage(event, room, roomId);
  socket.onclose = () => handleSocketClose(socket, room, roomId);
  socket.onerror = (error) => console.error("WebSocket error:", error);
}

async function getOrCreateRoom(roomId: string): Promise<RoomData> {
  if (!rooms.has(roomId)) {
    const kv = await Deno.openKv();
    const result = await kv.get<string[]>([roomId]);
    rooms.set(roomId, { sockets: [], messages: result.value || [], resetTimer: null });
  }
  return rooms.get(roomId)!;
}

function handleSocketOpen(socket: WebSocket, room: RoomData, roomId: string): void {
  console.log("WebSocket connection established!");
  room.messages.forEach((msg) => socket.send(msg));
  room.sockets.push(socket);

  // 接続があったらリセットタイマーをクリア
  if (room.resetTimer) {
    clearTimeout(room.resetTimer);
    room.resetTimer = null;
  }
}

async function handleSocketMessage(event: MessageEvent, room: RoomData, roomId: string): Promise<void> {
  console.log("Message from client:", event.data);
  room.messages.push(event.data as string);

  const kv = await Deno.openKv();
  await kv.set([roomId], room.messages);

  room.sockets.forEach((s) => {
    if (s.readyState === WebSocket.OPEN) {
      s.send(event.data);
    }
  });
}

function handleSocketClose(socket: WebSocket, room: RoomData, roomId: string): void {
  console.log("WebSocket connection closed.");
  const index = room.sockets.indexOf(socket);
  if (index !== -1) room.sockets.splice(index, 1);

  // ルームの接続数が0になったら10秒後にリセット
  if (room.sockets.length === 0) {
    room.resetTimer = setTimeout(() => resetRoom(roomId), 10000);
  }
}

async function resetRoom(roomId: string): Promise<void> {
  const room = rooms.get(roomId);
  if (room && room.sockets.length === 0) {
    const kv = await Deno.openKv();
    await kv.delete([roomId]);
    room.messages = [];
    console.log(`Room ${roomId} has been reset due to inactivity.`);
  }
}

export async function resetHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const roomId = url.searchParams.get("room") || "default";

  if (req.method === "POST") {
    try {
      await resetRoom(roomId);
      return new Response("Chat reset successfully", { status: 200 });
    } catch (error) {
      console.error("Error resetting chat:", error);
      return new Response("Failed to reset chat", { status: 500 });
    }
  } else {
    return new Response("Method Not Allowed", { status: 405 });
  }
}
