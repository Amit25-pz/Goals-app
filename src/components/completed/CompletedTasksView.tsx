import { useMemo } from 'react';
import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { he } from '../../utils/he';
import CategoryBadge from '../shared/CategoryBadge';
import './CompletedTasksView.css';

export default function CompletedTasksView() {
  const { categories, refreshKey } = useApp();

  // Scan all localStorage for completed tasks across all periods
  const completedTasks = useMemo(() => {
    const tasks: Task[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('goals_tasks_')) {
        try {
          const stored: Task[] = JSON.parse(localStorage.getItem(key)!);
          stored.filter(t => t.isCompleted && !t.parentTaskId).forEach(t => tasks.push(t));
        } catch { /* skip */ }
      }
    }
    // Sort by completion date, newest first
    tasks.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
    return tasks;
  }, [refreshKey]);

  // Group by completion month
  const groupedByMonth = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    completedTasks.forEach(t => {
      if (!t.completedAt) return;
      const month = t.completedAt.substring(0, 7); // "2026-03" format
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(t);
    });
    // Sort months newest first
    return Object.fromEntries(
      Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))
    );
  }, [completedTasks]);

  return (
    <div className="completed-tasks-view">
      <h2>{he.navCompleted}</h2>
      <p className="completed-summary">{he.totalCompleted}: {completedTasks.length}</p>

      {Object.entries(groupedByMonth).map(([month, tasks]) => {
        const monthDate = new Date(month + '-01');
        const monthLabel = monthDate.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
        return (
          <div key={month} className="completed-month-group">
            <div className="completed-month-header">
              {monthLabel} ({tasks.length})
            </div>
            <div className="completed-task-list">
              {tasks.map(t => (
                <div key={t.id} className="completed-task-row">
                  <span className="completed-check">&#10003;</span>
                  <span className="completed-task-title">{t.title}</span>
                  <CategoryBadge categoryId={t.categoryId} />
                  <span className="completed-task-level">{he.planLevelLabel(t.planLevel)}</span>
                  {t.completedAt && (
                    <span className="completed-task-date">
                      {new Date(t.completedAt).toLocaleDateString('he-IL')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {completedTasks.length === 0 && <p className="empty-msg">{he.noCompletedTasks}</p>}
    </div>
  );
}
