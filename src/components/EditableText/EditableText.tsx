import React, { useState, useRef, useEffect } from 'react';
import "./EditableText.css";
import { FaEdit } from "react-icons/fa";
interface EditableTextProps {
  text: string;
  onTextChange: (newText: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({ text, onTextChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const handleFocus = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 100);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onTextChange(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleEditButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleFocus();
  };

  return (
    <div className="editable-text-container">
      <button
        className="edit-button"
        onClick={handleEditButtonClick}
        aria-label="Edit"
      >
        <FaEdit />
      </button>
      {isEditing ? (
        <input
          ref={inputRef}
          className="editable-text-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span className="editable-text-span">{value}</span>
      )}
    </div>
  );
};

export default EditableText;
