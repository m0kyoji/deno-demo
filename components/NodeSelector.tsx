import { useState } from "preact/hooks";
import { NODE } from "../islands/WebSocketClient.tsx";

interface NodeSelectorProps {
  selectedNodes: string[];
  allNodes: NODE[];
  onChange: (newNodes: string[]) => void;
  label: string;
  currentNodeId: string;
}

export const NodeSelector = ({ selectedNodes, allNodes, onChange, label, currentNodeId }: NodeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 現在のノードIDを除外したノードリストを作成
  const filteredNodes = allNodes.filter((node) => node.id !== currentNodeId);

  const handleNodeChange = (nodeId: string) => {
    const updatedNodes = selectedNodes.includes(nodeId)
        ? selectedNodes.filter(id => id !== nodeId)
        : [...selectedNodes, nodeId];
    onChange(updatedNodes);
  };

  const getSelectedNodeNames = () => {
    return selectedNodes
        .map(id => allNodes.find(node => node.id === id)?.name)
        .filter(Boolean)
        .join(", ");
  };

  return (
      <div>
        <label>{label}:</label>
        <div style={{ position: "relative" }}>
          <div
              onClick={() => setIsOpen(!isOpen)}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#fff"
              }}
          >
            {selectedNodes.length > 0 ? getSelectedNodeNames() : "Select nodes"}
          </div>
          {isOpen && (
              <div style={{
                position: "absolute",
                zIndex: 1,
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {filteredNodes.map((node) => (
                    <div key={node.id} style={{ padding: "5px", cursor: "pointer", backgroundColor: selectedNodes.includes(node.id) ? "#007bff" : "transparent", color: selectedNodes.includes(node.id) ? "#fff" : "#000" }} onClick={() => handleNodeChange(node.id)}>
                      {node.name}
                      {console.log(node)}
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};
