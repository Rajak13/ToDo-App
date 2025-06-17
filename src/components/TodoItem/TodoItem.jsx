import { Check, Edit2, Save, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import "./TodoItem.css";

const TodoItem = ({ todo, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ""
  );

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    const result = await onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    });

    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setIsEditing(false);
  };

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div className="todo-content">
        <button
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`todo-checkbox ${todo.completed ? "checked" : ""}`}
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {todo.completed && <Check size={14} />}
        </button>

        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-input"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="edit-textarea"
              rows="2"
              placeholder="Description"
            />
          </div>
        ) : (
          <div className="todo-text">
            <h3 className="todo-title">{todo.title}</h3>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            <span className="todo-date">
              {new Date(todo.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="action-button">
              <Save size={16} />
            </button>
            <button onClick={handleCancel} className="action-button delete-button">
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="action-button edit-button">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(todo.id)} className="action-button delete-button">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
