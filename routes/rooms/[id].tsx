import { PageProps } from "$fresh/server.ts";
import WebSocketClient from "../../islands/WebSocketClient.tsx";

export default function Room({ params }: PageProps) {
  const roomId = params.id;

  return (
      <div>
        <h1>ルーム: {roomId}</h1>
        <WebSocketClient roomId={roomId} />
      </div>
  );
}
