import React, { useEffect, useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { supabase } from '../../services/supabaseClient';
import UserRow from './UserRow';

export default function UsersList() {
  const { profile } = useRole();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      let query = supabase.from('profiles').select('*');
      if (profile.role === 'manager') {
        query = query.eq('role', 'user');
      }
      const { data } = await query;
      setUsers(data || []);
    }
    if (profile) fetchUsers();
  }, [profile]);

  const handleRoleChange = async (user, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    setUsers(users => users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    await supabase.from('profiles').delete().eq('id', user.id);
    setUsers(users => users.filter(u => u.id !== user.id));
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: 'var(--white)', borderRadius: 8, boxShadow: 'var(--shadow)', padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 600 }}>Users</h2>
      {users.length === 0 ? (
        <div style={{ color: 'var(--text-light)', textAlign: 'center' }}>No users found.</div>
      ) : (
        users.map(user => (
          <UserRow
            key={user.id}
            user={user}
            canEditRole={profile.role === 'admin' || (profile.role === 'manager' && user.role === 'user')}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}
