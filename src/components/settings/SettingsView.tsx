import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { he } from '../../utils/he';
import * as storage from '../../services/storageService';
import { Download, Upload, Plus, Trash2 } from 'lucide-react';
import './SettingsView.css';

export default function SettingsView() {
  const { categories, addCategory, deleteCategory, refreshCategories } = useApp();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  const handleAddCategory = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newColor);
    setNewName('');
  };

  const handleExport = () => {
    const data = storage.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goals-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        storage.importAllData(reader.result as string);
        refreshCategories();
        setImportMsg(he.importSuccess);
      } catch {
        setImportMsg(he.importFailed);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-view">
      <h2>{he.settings}</h2>

      <section className="settings-section">
        <h3>{he.categoriesSettings}</h3>
        <div className="category-list">
          {categories.map(cat => (
            <div key={cat.id} className="category-row">
              <span className="cat-color" style={{ background: cat.color }} />
              <span className="cat-name">{cat.name}</span>
              {cat.isDefault ? (
                <span className="cat-badge">{he.defaultBadge}</span>
              ) : (
                <button className="btn-icon btn-danger" onClick={() => deleteCategory(cat.id)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="add-category-row">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={he.newCategoryPlaceholder}
            className="create-input"
          />
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="color-picker"
          />
          <button className="btn btn-primary" onClick={handleAddCategory} disabled={!newName.trim()}>
            <Plus size={14} /> {he.add}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3>{he.dataManagement}</h3>
        <div className="data-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={14} /> {he.exportData}
          </button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> {he.importData}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
        {importMsg && <p className="import-msg">{importMsg}</p>}
      </section>
    </div>
  );
}
