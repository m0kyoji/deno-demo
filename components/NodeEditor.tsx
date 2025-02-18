import { useState, useEffect } from "preact/hooks";
import { NODE, TAG } from "../islands/WebSocketClient.tsx";
import { TagSelector } from "./TagSelector.tsx";
import { NodeSelector } from "./NodeSelector.tsx";

interface NodeEditorProps {
  node: NODE;
  syncedObject: { nodes: NODE[]; tags: TAG[] };
  updateObject: (updatedObject: { nodes: NODE[]; tags: TAG[] }) => void;
}

export default function NodeEditor({ node, syncedObject, updateObject }: NodeEditorProps) {
  const [editNode, setEditNode] = useState({ ...node });

  console.log('node', node)

  // syncedObject が変更された際に editNode を更新
  useEffect(() => {
    const currentNode = syncedObject.nodes.find((n) => n.id === node.id);
    if (currentNode) {
      setEditNode(currentNode); // syncedObject の中の node に一致するものを見つけて editNode を更新
    }
  }, [syncedObject, node.id]); // syncedObject または node.id が変更された時に再実行

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    setEditNode((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (selectedTags: string[]) => {
    setEditNode((prev) => ({ ...prev, tags: selectedTags }));
  };

  const handleParentNodeChange = (selectedNodes: string[]) => {
    setEditNode((prev) => ({ ...prev, parent_nodes: selectedNodes }));
  };

  const handleChildNodeChange = (selectedNodes: string[]) => {
    setEditNode((prev) => ({ ...prev, child_nodes: selectedNodes }));
  };

  const saveNode = () => {
    const updatedNodes = syncedObject.nodes.map((n) =>
        n.id === editNode.id ? editNode : n
    );
    updateObject({ ...syncedObject, nodes: updatedNodes });
  };

  return (
      <div style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
        <input
            type="text"
            name="name"
            value={editNode.name}
            onChange={handleChange}
            placeholder="タイトル"
        />
        <textarea
            name="description"
            value={editNode.description}
            onChange={handleChange}
            placeholder="説明文"
        />

        <TagSelector
            selectedTags={editNode.tags}
            allTags={syncedObject.tags}
            onChange={handleTagChange}
        />

        <NodeSelector
            selectedNodes={editNode.parent_nodes}
            allNodes={syncedObject.nodes}
            onChange={handleParentNodeChange}
            label="親ノード"
            currentNodeId={node.id}  // 現在のノードIDを渡す
        />

        <NodeSelector
            selectedNodes={editNode.child_nodes}
            allNodes={syncedObject.nodes}
            onChange={handleChildNodeChange}
            label="子ノード"
            currentNodeId={node.id}  // 現在のノードIDを渡す
        />

        <button onClick={saveNode}>保存</button>
      </div>
  );
}
