import { useState } from 'react';
import * as storage from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { he } from '../../utils/he';
import { User, Plus, LogOut, Edit2 } from 'lucide-react';
import './UserSelector.css';

export default function UserSelector() {
  const { currentUser, users, switchUser, createNewUser, deleteCurrentUser, triggerRefresh } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [renamingUserId, setRenamingUserId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      createNewUser(newUserName);
      setNewUserName('');
      setShowNewForm(false);
      setIsOpen(false);
    }
  };

  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    setIsOpen(false);
  };

  const handleRenameUser = (userId: string, newName: string) => {
    if (!newName.trim()) return;
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, name: newName } : u
    );
    storage.saveUsers(updatedUsers);
    setRenamingUserId(null);
    triggerRefresh();
  };

  const canDelete = users.length > 1;

  return (
    <div className="user-selector">
      <button className="user-button" onClick={() => setIsOpen(!isOpen)}>
        <User size={16} />
        <span className="user-name">{currentUser?.name || 'משתמש'}</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="user-list-header">{he.selectUser}</div>

          <div className="user-list">
            {users.map(user => (
              <div key={user.id} className="user-item-wrapper">
                {renamingUserId === user.id ? (
                  <div className="user-rename-form">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameUser(user.id, renameValue);
                        if (e.key === 'Escape') setRenamingUserId(null);
                      }}
                      autoFocus
                      className="user-input-inline"
                    />
                    <button
                      className="btn-inline"
                      onClick={() => handleRenameUser(user.id, renameValue)}
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className={`user-item ${user.id === currentUser?.id ? 'active' : ''}`}
                      onClick={() => handleSwitchUser(user.id)}
                    >
                      <span>{user.name}</span>
                      {user.id === currentUser?.id && <span className="checkmark">✓</span>}
                    </button>
                    {user.id === currentUser?.id && (
                      <button
                        className="user-rename-btn"
                        onClick={() => {
                          setRenamingUserId(user.id);
                          setRenameValue(user.name);
                        }}
                        title={he.renameUser}
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {!showNewForm ? (
            <button
              className="user-action-btn"
              onClick={() => setShowNewForm(true)}
            >
              <Plus size={14} /> {he.addUser}
            </button>
          ) : (
            <div className="new-user-form">
              <input
                type="text"
                placeholder={he.userNamePlaceholder}
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateUser()}
                autoFocus
                className="user-input"
              />
              <div className="form-buttons">
                <button
                  className="btn btn-small"
                  onClick={handleCreateUser}
                  disabled={!newUserName.trim()}
                >
                  {he.create}
                </button>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewUserName('');
                  }}
                >
                  {he.cancel}
                </button>
              </div>
            </div>
          )}

          {canDelete && (
            <button
              className="user-delete-btn"
              onClick={() => {
                if (window.confirm(he.confirmDeleteUser)) {
                  deleteCurrentUser();
                  setIsOpen(false);
                }
              }}
            >
              <LogOut size={14} /> {he.deleteUser}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
