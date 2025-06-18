import React from 'react';

export default function RoleDropdown({ value, onChange, disabled, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        border: '1px solid var(--primary-color)',
        background: 'var(--white)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        fontWeight: 500,
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: 90,
      }}
    >
      {options.map(opt => (
        <option key={opt} value={opt} style={{ color: 'var(--text-primary)' }}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  );
}
