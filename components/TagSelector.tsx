import { TAG } from "../islands/WebSocketClient.tsx";

interface TagSelectorProps {
  selectedTags: string[];
  allTags: TAG[];
  onChange: (newTags: string[]) => void;
}

export const TagSelector = ({ selectedTags, allTags, onChange }: TagSelectorProps) => {
  const handleTagChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const checked = target.checked;

    let updatedTags;
    if (checked) {
      updatedTags = [...selectedTags, value];
    } else {
      updatedTags = selectedTags.filter((tag) => tag !== value);
    }
    onChange(updatedTags);
  };

  return (
      <div>
        <label>タグ選択:</label>
        {allTags.map((tag) => (
            <label key={tag.id} style={{ display: "block" }}>
              <input
                  type="checkbox"
                  value={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onChange={handleTagChange}
              />
              {tag.name}
            </label>
        ))}
      </div>
  );
};