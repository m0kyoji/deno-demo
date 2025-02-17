import { useState, useEffect, useRef } from "preact/hooks";

interface WebSocketClientProps {
  roomId: string;
}

export default function WebSocketClient({ roomId }: WebSocketClientProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(`ws://localhost:8000/api/ws?room=${roomId}`);

      socket.onopen = () => {
        console.log("WebSocket connected (client)");
      };

      socket.onmessage = (event) => {
        console.log("Message from server:", event.data);
        setMessages((prev) => [...prev, event.data]);
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

  const sendMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(input);
      setInput("");
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
      <div>
        <h2>チャット</h2>
        <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
          {messages.map((msg, index) => (
              <div key={index}>{msg}</div>
          ))}
        </div>
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="メッセージを入力..."
        />
        <button onClick={sendMessage}>送信</button>
      </div>
  );
}
