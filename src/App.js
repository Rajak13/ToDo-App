import React, { useEffect, useState } from 'react'
import './App.css'
import Auth from './components/Auth/Auth'
import SupabaseDiagnostics from './components/Diagnostics/SupabaseDiagnostics'
import Header from './components/Layout/Header'
import ProfilePage from './components/Profile/ProfilePage'
import TodoForm from './components/TodoForm/TodoForm'
import TodoList from './components/TodoList/TodoList'
import UsersList from './components/Users/UsersList'
import { useAuth } from './context/AuthContext'
import { useRole } from './context/RoleContext'
import { useTodos } from './hooks/useTodos'
import { checkSupabaseEnv } from './utils/checkEnv'

const AppContent = () => {
  const { user } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError
  } = useRole();
  
  const [activePage, setActivePage] = useState('todos');
  const [envWarning, setEnvWarning] = useState(null);

  useEffect(() => {
    // Check if Supabase environment variables are set correctly
    const envStatus = checkSupabaseEnv();
    if (!envStatus.isConfigured) {
      setEnvWarning({
        message: "Supabase configuration issue detected",
        details: envStatus.issues
      });
      console.error("Supabase environment issues:", envStatus.issues);
    }
  }, []);

  const {
    todos,
    loading: todosLoading,
    error: todosError,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  } = useTodos();

  // Handle navigation between pages
  const handleNavigate = (page) => {
    setActivePage(page);
  };

  if (profileError || todosError) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{profileError || todosError}</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Check if the profile is incomplete
  const isProfileIncomplete = !profile || !profile.first_name || !profile.last_name;
  
  // Force profile page if profile is incomplete
  if (isProfileIncomplete) {
    return (
      <div className="App">
        <Header activePage="profile" onNavigate={handleNavigate} />
        <main className="main-content">
          <div className="container">
            <div className="welcome-message">
              <h2>Welcome! Please Complete Your Profile</h2>
              <p>We need some information to get started.</p>
            </div>
            {envWarning && (
              <div className="env-warning">
                <h3>{envWarning.message}</h3>
                <ul>
                  {envWarning.details.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
                <p>Please check your environment variables in .env file.</p>
              </div>
            )}
            <ProfilePage />
          </div>
        </main>
      </div>
    );
  }

  // Role-based content
  const isAdmin = profile.role === 'admin';
  const isManager = profile.role === 'manager' || isAdmin;

  // Render different pages based on navigation state
  const renderContent = () => {
    switch(activePage) {
      case 'profile':
        return (
          <>
            {envWarning && (
              <div className="env-warning">
                <h3>{envWarning.message}</h3>
                <ul>
                  {envWarning.details.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
                <p>Please check your environment variables in .env file.</p>
              </div>
            )}
            <ProfilePage />
          </>
        );
      
      case 'users':
        // Only accessible to managers and admins
        return isManager ? <UsersList /> : <NotAuthorized />;
      
      case 'settings':
        // Only accessible to admins
        return isAdmin ? <div className="settings-page">Settings Page (Admin Only)</div> : <NotAuthorized />;
      
      case 'diagnostics':
        // Only accessible to admins
        return isAdmin ? <SupabaseDiagnostics /> : <NotAuthorized />;
      
      case 'todos':
      default:
        return (
          <>
            <TodoForm onSubmit={createTodo} loading={todosLoading} />
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
              loading={todosLoading}
            />
          </>
        );
    }
  };

  return (
    <div className="App">
      <Header activePage={activePage} onNavigate={handleNavigate} />
      <main className="main-content">
        <div className="container">
          {renderContent()}
          
          {/* Admin-only diagnostics link */}
          {isAdmin && envWarning && activePage !== 'diagnostics' && (
            <div className="diagnostics-link">
              <p>Having trouble with uploads or storage? Check the <button onClick={() => setActivePage('diagnostics')}>Diagnostics Page</button></p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Not authorized component
const NotAuthorized = () => (
  <div className="not-authorized">
    <h2>Access Denied</h2>
    <p>You don't have permission to view this page.</p>
  </div>
);

function App() {
  const { user } = useAuth();
  return user ? <AppContent /> : <Auth />;
}

export default App