import { AlertCircle, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import AvatarUpload from './AvatarUpload';
import './ProfileForm.css';

export default function ProfileForm({ profile, onSave }) {
  const { signOut } = useAuth();
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Delete the user's profile first
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (profileDeleteError) throw profileDeleteError;

      // Delete the user's authentication record
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(profile.id);

      if (authDeleteError) throw authDeleteError;

      // Sign out after successful deletion
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error.message || 'Failed to delete account');
      setIsDeleting(false);
      // Keep the confirmation dialog open if there's an error
      return;
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  return (
    <div className="profile-form-container">
      <form
        onSubmit={async e => {
          e.preventDefault();
          setSaving(true);
          await onSave(form);
          setSaving(false);
        }}
        className="profile-form"
      >
        <AvatarUpload userId={form.id} currentAvatarUrl={form.avatar_url} onAvatarUpdate={url => setForm(f => ({ ...f, avatar_url: url }))} />
        
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="first_name"
            value={form.first_name || ''}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="last_name"
            value={form.last_name || ''}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            value={form.email || ''}
            readOnly
            className="form-input readonly"
          />
          <small>Email cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio || ''}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            rows={3}
            className="form-textarea"
          />
        </div>
        
        <button
          type="submit"
          className="submit-button"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>Delete your account and all associated data. This action cannot be undone.</p>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={handleDeleteAccount}
            className="delete-account-button"
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        ) : (
          <div className="delete-confirmation">
            <div className="confirmation-message">
              <AlertCircle size={20} />
              <p>Are you sure? This will permanently delete your account and all data.</p>
            </div>
            <div className="confirmation-buttons">
              <button 
                onClick={handleDeleteAccount}
                className="confirm-delete-button"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button 
                onClick={cancelDelete}
                className="cancel-button"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
            {deleteError && (
              <div className="delete-error">
                {deleteError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
