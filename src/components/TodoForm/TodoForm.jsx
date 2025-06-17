import { Plus } from "lucide-react";
import React, { useState } from "react";
import "./TodoForm.css";

const TodoForm = ({ onSubmit, loading }) => {
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const result = await onSubmit(title.trim(), description.trim());
    if (result.success) {
    setTitle("");
    setDescription("");
    }
};

return (
    <form onSubmit={handleSubmit} className="todo-form">
    <div className="form-group">
        <input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="todo-input"
        required
        />
    </div>
    <div className="form-group">
        <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="todo-textarea"
        rows="3"
        />
    </div>
    <button type="submit" disabled={loading} className="add-btn">
        <Plus size={20} />
        Add Todo
    </button>
    </form>
);
};

export default TodoForm;
