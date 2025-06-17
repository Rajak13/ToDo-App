import React from 'react'
import './App.css'
import Header from './components/Layout/Header'
import TodoForm from './components/TodoForm/TodoForm'
import TodoList from './components/TodoList/TodoList'
import { useTodos } from './hooks/useTodos'

function App() {
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  } = useTodos()

  if (error) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="container">
          <TodoForm onSubmit={createTodo} loading={loading} />
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            loading={loading}
          />
        </div>
      </main>
    </div>
  )
}

export default App