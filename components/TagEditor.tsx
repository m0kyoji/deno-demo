import { useState, useEffect } from "preact/hooks";
import { NODE, TAG } from "../islands/WebSocketClient.tsx";

interface TagEditorProps {
  tag: TAG;
  syncedObject: { nodes: NODE[]; tags: TAG[] };
  updateObject: (updatedTag: { nodes: NODE[]; tags: TAG[] }) => void;
}

export default function TagEditor({ tag, syncedObject, updateObject }: TagEditorProps) {
  const [editTag, setEditTag] = useState(tag);

  // syncedObject が変更された際に editNode を更新
  useEffect(() => {
    const currentNode = syncedObject.tags.find((n) => n.id === tag.id);
    if (currentNode) {
      setEditTag(currentNode); // syncedObject の中の node に一致するものを見つけて editNode を更新
    }
  }, [syncedObject, tag.id]); // syncedObject または node.id が変更された時に再実行

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setEditTag((prev) => ({ ...prev, [name]: value }));
  };

  const saveTag = () => {
    const updatedTags = syncedObject.tags.map((t) =>
        t.id === editTag.id ? editTag : t
    );
    updateObject({ ...syncedObject, tags: updatedTags });
  };

  return (
      <div style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
        <input
            type="text"
            name="name"
            value={editTag.name}
            onChange={handleChange}
            placeholder="タイトル"
        />
        <button onClick={saveTag}>保存</button>
      </div>
  );
}
