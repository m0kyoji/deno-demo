import { useState, useEffect, useRef } from "preact/hooks";
import { MessageArea } from "../components/MessageArea.tsx";

interface WebSocketClientProps {
  roomId: string;
}

interface WebSocketMessage {
  type: 'chat' | 'object';
  data: string | object;
}

export default function WebSocketClient({ roomId }: WebSocketClientProps) {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [syncedObject, setSyncedObject] = useState<object | null>(null);

  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);


  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(`ws://localhost:8000/api/ws?room=${roomId}`);

      socket.onopen = () => {
        console.log("WebSocket connected (client)");
      };

      socket.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'chat':
            setChatMessages((prev) => [...prev, message.data as string]);
            break;
          case 'object':
            setSyncedObject(message.data as object);
            break;
          default:
            console.error('Unknown message type:', message.type);
        }
      };


      socket.onclose = () => {
        console.log("WebSocket disconnected (client)");
        setTimeout(connectWebSocket, 3000);
      };

      socketRef.current = socket;
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomId]);

  const sendMessage = (type: 'chat' | 'object', data: string | object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { type, data };
      socketRef.current.send(JSON.stringify(message));
      setInput("");
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
      <div>
        <MessageArea
            messages={chatMessages}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
        />

        <h2>同期オブジェクト</h2>
        <pre>{JSON.stringify(syncedObject, null, 2)}</pre>
        {/* オブジェクト編集用のUIを追加 */}
      </div>
  );
}
