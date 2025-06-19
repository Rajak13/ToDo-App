import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRole } from '../context/RoleContext'
import { supabase } from '../services/supabaseClient'

export const useTodos = () => {
    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user } = useAuth()
    const { profile } = useRole()

    // Check if user can perform action based on role
    const canPerformAction = (action, todoUserId = null) => {
        if (!profile) return false;

        switch (action) {
            case 'create':
                return true; // All authenticated users can create todos
            case 'read':
                return true; // Handled by RLS policies
            case 'update':
            case 'delete':
                // Admin can do anything
                if (profile.role === 'admin') return true;
                // Manager can modify their own todos and regular users' todos
                if (profile.role === 'manager') {
                    return todoUserId === user.id || profile.role === 'user';
                }
                // Regular users can only modify their own todos
                return todoUserId === user.id;
            default:
                return false;
        }
    };

    // Fetch all todos based on user role
    const fetchTodos = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!user || !profile) {
                throw new Error('Authentication required')
            }

            let query = supabase
                .from('todos')
                .select('*, profiles:user_id(role)')
                .order('created_at', { ascending: false })

            // Filter based on role
            if (profile.role === 'user') {
                // Users can only see their own todos
                query = query.eq('user_id', user.id)
            } else if (profile.role === 'manager') {
                // Managers can see their own todos and todos of regular users
                // Use separate filter conditions instead of a single or statement
                query = query.or([
                    `user_id.eq.${user.id}`,
                    `profiles.role.eq.user`
                ])
            }
            // Admins can see all todos (no filter)

            const { data, error: todosError } = await query

            if (todosError) throw todosError
            setTodos(data || [])
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    // Create new todo
    const createTodo = async (title, description = '') => {
        try {
            if (!user) throw new Error('Authentication required')
            if (!canPerformAction('create')) {
                throw new Error('You do not have permission to create todos')
            }

            if (!title.trim()) {
                throw new Error('Title is required')
            }

            if (title.length > 100) {
                throw new Error('Title must be less than 100 characters')
            }

            if (description.length > 500) {
                throw new Error('Description must be less than 500 characters')
            }

            const { data, error } = await supabase
                .from('todos')
                .insert([{ 
                    title: title.trim(), 
                    description: description.trim(), 
                    user_id: user.id 
                }])
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
            if (!user) throw new Error('Authentication required')

            const todo = todos.find(t => t.id === id)
            if (!todo) throw new Error('Todo not found')

            if (!canPerformAction('update', todo.user_id)) {
                throw new Error('You do not have permission to update this todo')
            }

            if (updates.title !== undefined) {
                if (!updates.title.trim()) {
                    throw new Error('Title is required')
                }
                if (updates.title.length > 100) {
                    throw new Error('Title must be less than 100 characters')
                }
            }

            if (updates.description !== undefined && updates.description.length > 500) {
                throw new Error('Description must be less than 500 characters')
            }

            const { data, error } = await supabase
                .from('todos')
                .update({
                    ...updates,
                    title: updates.title?.trim(),
                    description: updates.description?.trim()
                })
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
            if (!user) throw new Error('Authentication required')

            const todo = todos.find(t => t.id === id)
            if (!todo) throw new Error('Todo not found')

            if (!canPerformAction('delete', todo.user_id)) {
                throw new Error('You do not have permission to delete this todo')
            }

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

    // Subscribe to realtime changes
    useEffect(() => {
        if (!user) return

        const subscription = supabase
            .channel('public:todos')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public',
                    table: 'todos',
                }, 
                (payload) => {
                    // Only refresh if the change is relevant to the user's role
                    if (profile.role === 'admin' || 
                        payload.new.user_id === user.id || 
                        (profile.role === 'manager')) {
                        fetchTodos()
                    }
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user, profile])

    // Initial fetch
    useEffect(() => {
        if (user && profile) {
            fetchTodos()
        }
    }, [user, profile])

    return {
        todos,
        loading,
        error,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        refetch: fetchTodos,
        canPerformAction
    }
}
