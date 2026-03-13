import { useState } from 'react';
import type { PlanLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import { he } from '../../utils/he';
import { Plus } from 'lucide-react';
import './TaskCreateForm.css';

interface Props {
  planLevel: PlanLevel;
  monthKey?: string | null;
  weekKey?: string | null;
  dayKey?: string | null;
  assignedDay?: string | null;
  parentTaskId?: string | null;
  onCreated?: () => void;
}

export default function TaskCreateForm({ planLevel, monthKey, weekKey, dayKey, assignedDay, parentTaskId, onCreated }: Props) {
  const { categories, createTask } = useApp();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [showFull, setShowFull] = useState(false);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask({
      title: title.trim(),
      categoryId,
      description,
      dueDate: dueDate || null,
      planLevel,
      monthKey: monthKey !== undefined ? monthKey : undefined,
      weekKey: weekKey !== undefined ? weekKey : undefined,
      dayKey: dayKey !== undefined ? dayKey : undefined,
      assignedDay: assignedDay || null,
      parentTaskId: parentTaskId || null,
    });
    setTitle('');
    setDescription('');
    setDueDate('');
    setShowFull(false);
    onCreated?.();
  };

  return (
    <form className="task-create-form" onSubmit={handleSubmit}>
      <div className="create-row-main">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={parentTaskId ? he.addSubtask : he.addNewTask}
          className="create-input"
        />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="create-select">
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="button" className="btn-text" onClick={() => setShowFull(!showFull)}>
          {showFull ? he.less : he.more}
        </button>
        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
          <Plus size={14} /> {he.add}
        </button>
      </div>
      {showFull && (
        <div className="create-row-extra">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={he.description + '...'}
            rows={2}
            className="create-textarea"
          />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="create-date"
          />
        </div>
      )}
    </form>
  );
}
