import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import * as storage from '../../services/storageService';
import { he, formatMonthHe } from '../../utils/he';
import { getMonthKey, getWeekKey } from '../../utils/dateHelpers';
import CategoryBadge from '../shared/CategoryBadge';
import { Plus, ChevronDown } from 'lucide-react';
import './FutureTasksView.css';

export default function FutureTasksView() {
  const { categories, currentUser, createTask, refreshKey, triggerRefresh } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.id || 'general-default');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [pushingTaskId, setPushingTaskId] = useState<string | null>(null);
  const [pushTarget, setPushTarget] = useState<'month' | 'week'>('month');
  const [targetMonth, setTargetMonth] = useState(getMonthKey());
  const [targetWeek, setTargetWeek] = useState(getWeekKey());

  const futureTasks = useMemo(() => {
    if (!currentUser) return [];
    return storage.getFutureTasks(currentUser.id).filter(t => !t.parentTaskId);
  }, [refreshKey, currentUser]);

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    categories.forEach(cat => { grouped[cat.id] = []; });
    futureTasks.forEach(t => {
      if (!grouped[t.categoryId]) grouped[t.categoryId] = [];
      grouped[t.categoryId].push(t);
    });
    return grouped;
  }, [futureTasks, categories]);

  const handleAddTask = () => {
    if (!newTitle.trim() || !currentUser) return;
    const task: Task = {
      id: uuidv4(),
      title: newTitle,
      categoryId: newCategory,
      description: '',
      createdAt: new Date().toISOString(),
      dueDate: null,
      isCompleted: false,
      completedAt: null,
      statusUpdate: '',
      parentTaskId: null,
      planLevel: 'monthly', // Future tasks have a default level
      monthKey: null,
      weekKey: null,
      dayKey: null,
      assignedDay: null,
      sourceTaskId: null,
      sortOrder: 0,
      yearKey: null,
    };
    storage.saveFutureTask(currentUser.id, task);
    setNewTitle('');
    triggerRefresh();
  };

  const handlePushTask = (task: Task) => {
    if (!currentUser) return;
    if (pushTarget === 'month') {
      // Create task at monthly level
      const monthlyTask: Task = {
        ...task,
        id: uuidv4(),
        sourceTaskId: task.id,
        planLevel: 'monthly',
        monthKey: targetMonth,
        weekKey: null,
        dayKey: null,
        assignedDay: null,
        yearKey: null,
      };
      storage.saveTask(currentUser.id, monthlyTask);
    } else {
      // Create task at weekly level
      const weeklyTask: Task = {
        ...task,
        id: uuidv4(),
        sourceTaskId: task.id,
        planLevel: 'weekly',
        monthKey: null,
        weekKey: targetWeek,
        dayKey: null,
        assignedDay: null,
        yearKey: null,
      };
      storage.saveTask(currentUser.id, weeklyTask);
    }
    storage.deleteFutureTask(currentUser.id, task.id);
    setPushingTaskId(null);
    triggerRefresh();
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentUser) return;
    storage.deleteFutureTask(currentUser.id, taskId);
    triggerRefresh();
  };

  return (
    <div className="future-tasks-view">
      <h2>{he.navFuture}</h2>
      <p className="future-desc">{he.futureTasksDesc}</p>

      {/* Add new future task */}
      <div className="future-add-form">
        <div className="form-row">
          <input
            type="text"
            placeholder={he.addNewTask}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            className="task-input"
          />
          <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="category-select">
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleAddTask}>
            <Plus size={16} /> {he.add}
          </button>
        </div>
      </div>

      {/* Future tasks by category */}
      <div className="future-tasks-list">
        {categories.map(cat => {
          const tasks = groupedByCategory[cat.id];
          if (!tasks || tasks.length === 0) return null;
          return (
            <div key={cat.id} className="future-category-group">
              <div className="future-category-header" style={{ color: cat.color }}>
                <span className="future-cat-dot" style={{ background: cat.color }} />
                {cat.name} ({tasks.length})
              </div>
              <div className="future-task-items">
                {tasks.map(t => (
                  <div key={t.id} className="future-task-card">
                    <div className="future-task-header">
                      <span className="future-task-title">{t.title}</span>
                      <button
                        className="btn-icon"
                        onClick={() => setExpandedTask(expandedTask === t.id ? null : t.id)}
                      >
                        <ChevronDown size={16} style={{
                          transform: expandedTask === t.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }} />
                      </button>
                    </div>
                    {expandedTask === t.id && (
                      <div className="future-task-details">
                        {t.description && <p className="future-task-desc">{t.description}</p>}
                        <div className="future-task-actions">
                          <button
                            className="btn btn-secondary"
                            onClick={() => setPushingTaskId(pushingTaskId === t.id ? null : t.id)}
                          >
                            {he.pushToMonth}
                          </button>
                          <button
                            className="btn-text"
                            onClick={() => handleDeleteTask(t.id)}
                            style={{ color: '#f38ba8' }}
                          >
                            {he.delete}
                          </button>
                        </div>
                        {pushingTaskId === t.id && (
                          <div className="push-options">
                            <div className="push-row">
                              <label>
                                <input
                                  type="radio"
                                  name={`push-${t.id}`}
                                  value="month"
                                  checked={pushTarget === 'month'}
                                  onChange={e => setPushTarget(e.target.value as 'month' | 'week')}
                                />
                                {he.pushToMonth}
                              </label>
                              <select value={targetMonth} onChange={e => setTargetMonth(e.target.value)} className="select-small">
                                {/* Generate list of months - past 12 + future 12 */}
                                {Array.from({ length: 24 }, (_, i) => {
                                  const date = new Date();
                                  date.setMonth(date.getMonth() - 12 + i);
                                  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                  return (
                                    <option key={key} value={key}>
                                      {formatMonthHe(key)}
                                    </option>
                                  );
                                })}
                              </select>
                              <button className="btn btn-small" onClick={() => handlePushTask(t)}>
                                {he.confirm}
                              </button>
                            </div>
                            <div className="push-row">
                              <label>
                                <input
                                  type="radio"
                                  name={`push-${t.id}`}
                                  value="week"
                                  checked={pushTarget === 'week'}
                                  onChange={e => setPushTarget(e.target.value as 'month' | 'week')}
                                />
                                {he.pushToWeek}
                              </label>
                              <input
                                type="text"
                                placeholder="YYYY-Www"
                                value={targetWeek}
                                onChange={e => setTargetWeek(e.target.value)}
                                className="input-small"
                              />
                              <button className="btn btn-small" onClick={() => handlePushTask(t)}>
                                {he.confirm}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {futureTasks.length === 0 && <p className="empty-msg">{he.noFutureTasks}</p>}
    </div>
  );
}
