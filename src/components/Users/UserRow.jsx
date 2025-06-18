import React from 'react';
import RoleDropdown from './RoleDropdown';

export default function UserRow({ user, canEditRole, onRoleChange, onDelete }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 0',
      borderBottom: '1px solid var(--background-color)',
    }}>
      <img
        src={user.avatar_url || '/default-avatar.png'}
        alt="avatar"
        width={40}
        height={40}
        style={{ borderRadius: '50%', objectFit: 'cover', background: 'var(--background-color)' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.first_name} {user.last_name}
        </div>
        <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
      </div>
      <div style={{ minWidth: 120 }}>
        <RoleDropdown
          value={user.role}
          onChange={role => onRoleChange(user, role)}
          disabled={!canEditRole}
          options={['admin', 'manager', 'user']}
        />
      </div>
      <button
        onClick={() => onDelete(user)}
        style={{
          background: 'var(--danger-color)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: 4,
          padding: '0.4rem 0.8rem',
          fontWeight: 500,
          cursor: 'pointer',
          marginLeft: 8,
        }}
        title="Delete user"
      >
        Delete
      </button>
    </div>
  );
}
