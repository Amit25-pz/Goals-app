import { useState } from 'react';
import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { he } from '../../utils/he';
import { Save, X } from 'lucide-react';
import './TaskEditForm.css';

interface Props {
  task: Task;
  onClose: () => void;
}

export default function TaskEditForm({ task, onClose }: Props) {
  const { categories, updateTask } = useApp();
  const [form, setForm] = useState({ ...task });

  const handleSave = () => {
    updateTask(form);
    onClose();
  };

  return (
    <div className="task-edit-form">
      <div className="edit-row">
        <label>{he.title}</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="edit-row">
        <label>{he.category}</label>
        <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="edit-row">
        <label>{he.description}</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>
      <div className="edit-row">
        <label>{he.dueDate}</label>
        <input type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value || null })} />
      </div>
      <div className="edit-row">
        <label>{he.statusUpdate}</label>
        <textarea value={form.statusUpdate} onChange={e => setForm({ ...form, statusUpdate: e.target.value })} rows={2} />
      </div>
      <div className="edit-actions">
        <button className="btn btn-primary" onClick={handleSave}><Save size={14} /> {he.save}</button>
        <button className="btn btn-secondary" onClick={onClose}><X size={14} /> {he.cancel}</button>
      </div>
    </div>
  );
}
