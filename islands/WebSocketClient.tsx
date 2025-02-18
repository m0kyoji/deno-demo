import { useState, useEffect, useRef } from "preact/hooks";
import { MessageArea } from "../components/MessageArea.tsx";
import NetworkDiagram from "../components/NetworkDiagram.tsx";
import NodeEditor from "../components/NodeEditor.tsx";
import TagEditor from "../components/TagEditor.tsx";

interface WebSocketClientProps {
  roomId: string;
}

export interface NODE {
  id: string;
  name: string;
  description: string;
  tags: string[];
  parent_nodes: string[];
  child_nodes: string[];
}

export interface TAG {
  id: string;
  name: string;
}

interface SyncedObject {
  nodes: NODE[];
  tags: TAG[];
}

interface WebSocketMessage {
  type: 'chat' | 'object';
  data: string | object;
}

export default function WebSocketClient({ roomId }: WebSocketClientProps) {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [syncedObject, setSyncedObject] = useState<{ nodes: NODE[]; tags: TAG[] } | null>(null);
  const [networkData, setNetworkData] = useState<{nodes: NODE[]; links: {source: string, target: string}[]}>({nodes: [], links: []})

  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (syncedObject) {
      const networkData = {
        nodes: syncedObject.nodes,
        links: syncedObject.nodes.flatMap(node =>
            node.child_nodes.map(childId => ({
              source: node.id,
              target: childId
            }))
        )
      };
      setNetworkData(networkData)
    }
  },[syncedObject])

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
            setSyncedObject(message.data as SyncedObject);
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

  const updateObject = (updatedObject: SyncedObject) => {
    setSyncedObject(updatedObject);
    sendMessage('object', updatedObject);
  };

  const addNewNode = () => {
    const newNode: NODE = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      tags: [],
      parent_nodes: [],
      child_nodes: [],
    };
    setSyncedObject((prev) => ({
      nodes: [...(prev?.nodes ?? []), newNode],
      tags: prev?.tags ?? [], // ここで tags の undefined を防ぐ
    }));
    sendMessage("object", {
      nodes: [...(syncedObject?.nodes ?? []), newNode],
      tags: syncedObject?.tags ?? [], // ここでも tags の undefined を防ぐ
    });
  };

  const addNewTag = () => {
    const newTag: TAG = {
      id: crypto.randomUUID(),
      name: "",
    };
    setSyncedObject((prev) => ({
      nodes: prev?.nodes ?? [],
      tags: [...(prev?.tags ?? []), newTag], // ここで tags の undefined を防ぐ
    }));
    sendMessage("object", {
      nodes: syncedObject?.nodes ?? [],
      tags: [...(syncedObject?.tags ?? []), newTag], // ここでも tags の undefined を防ぐ
    });
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
        <NetworkDiagram data={networkData} width={800} height={600} />

        <h3>ノード一覧</h3>
        <button onClick={ addNewNode }>新しいノードを追加</button>
        { syncedObject && syncedObject.nodes.map((node, index) => (
            <NodeEditor
                key={index}
                node={node}
                syncedObject={syncedObject}
                updateObject={updateObject}
            />
        ))}

        <h3>タグ一覧</h3>
        <button onClick={ addNewTag }>新しいタグを追加</button>
        { syncedObject && syncedObject.tags.map((tag, index) => (
            <TagEditor
                key={index}
                tag={tag}
                syncedObject={syncedObject}
                updateObject={updateObject}
            />
        ))}
      </div>
  );
}
