import React from 'react'
import TodoItem from '../TodoItem/TodoItem'
import './TodoList.css'

const TodoList = ({ todos, onToggle, onUpdate, onDelete, loading }) => {
  if (loading) {
    return <div className="loading">Loading todos...</div>
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>No todos yet. Add one above to get started!</p>
      </div>
    )
  }

  const activeTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

  return (
    <div className="todo-list">
      {activeTodos.length > 0 && (
        <div className="todo-section">
          <h2 className="section-title">Active ({activeTodos.length})</h2>
          {activeTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {completedTodos.length > 0 && (
        <div className="todo-section">
          <h2 className="section-title">Completed ({completedTodos.length})</h2>
          {completedTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TodoList