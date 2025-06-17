import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export const useTodos = () => {
    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch all todos
    const fetchTodos = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodos(data || [])
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Create new todo
    const createTodo = async (title, description = '') => {
        try {
            const { data, error } = await supabase
                .from('todos')
                .insert([{ title, description }])
                .select()

            if (error) throw error
            setTodos([data[0], ...todos])
            return { success: true, data: data[0] }
        } catch (error) {
            setError(error.message)
            return { success: false, error: error.message }
        }
    }

    // Update todo
    const updateTodo = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('todos')
                .update(updates)
                .eq('id', id)
                .select()

            if (error) throw error
            setTodos(todos.map(todo =>
                todo.id === id ? data[0] : todo
            ))
            return { success: true, data: data[0] }
        } catch (error) {
            setError(error.message)
            return { success: false, error: error.message }
        }
    }

    // Delete todo
    const deleteTodo = async (id) => {
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id)

            if (error) throw error
            setTodos(todos.filter(todo => todo.id !== id))
            return { success: true }
        } catch (error) {
            setError(error.message)
            return { success: false, error: error.message }
        }
    }

    // Toggle todo completion
    const toggleTodo = async (id, completed) => {
        return updateTodo(id, { completed })
    }

    useEffect(() => {
        fetchTodos()
    }, [])

    return {
        todos,
        loading,
        error,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        refetch: fetchTodos
    }
}
