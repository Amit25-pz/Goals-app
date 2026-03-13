import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import * as storage from '../../services/storageService';
import { he } from '../../utils/he';
import TaskCreateForm from '../shared/TaskCreateForm';
import TaskItem from '../shared/TaskItem';
import CompletionStats from '../shared/CompletionStats';
import CategoryCountBar from '../shared/CategoryCountBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './YearlyView.css';

export default function YearlyView() {
  const { categories, currentMonthKey, createTask, getTasksForPeriod, refreshKey, triggerRefresh, updateTask } = useApp();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());
  const [showPrevYear, setShowPrevYear] = useState(false);

  const yearlyTasks = useMemo(() => {
    return getTasksForPeriod('yearly', currentYear).filter(t => !t.parentTaskId);
  }, [currentYear, refreshKey]);

  const getSubtasks = (parentId: string) => {
    return getTasksForPeriod('yearly', currentYear).filter(t => t.parentTaskId === parentId);
  };

  const topLevelTasks = yearlyTasks.filter(t => !t.parentTaskId);

  // Group by category for display
  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    categories.forEach(cat => { grouped[cat.id] = []; });
    topLevelTasks.forEach(t => {
      if (!grouped[t.categoryId]) grouped[t.categoryId] = [];
      grouped[t.categoryId].push(t);
    });
    return grouped;
  }, [topLevelTasks, categories]);

  const navigateYear = (dir: number) => {
    const newYear = parseInt(currentYear) + dir;
    setCurrentYear(newYear.toString());
    setShowPrevYear(false);
  };

  const handlePullToMonth = (task: Task) => {
    const monthlyTask: Task = {
      ...task,
      id: uuidv4(),
      sourceTaskId: task.id,
      planLevel: 'monthly',
      yearKey: null,
      monthKey: currentMonthKey,
      weekKey: null,
      dayKey: null,
      assignedDay: null,
    };
    storage.saveTask(monthlyTask);
    triggerRefresh();
  };

  return (
    <div className="yearly-view">
      <div className="view-header">
        <button className="btn-icon" onClick={() => navigateYear(1)}><ChevronRight size={20} /></button>
        <h2>{currentYear} - {he.yearlyGoals}</h2>
        <button className="btn-icon" onClick={() => navigateYear(-1)}><ChevronLeft size={20} /></button>
      </div>

      <CompletionStats tasks={topLevelTasks} />
      <CategoryCountBar categories={categories} tasks={topLevelTasks} />

      {/* Reference to previous year */}
      <button className="btn btn-secondary" onClick={() => setShowPrevYear(!showPrevYear)}>
        {showPrevYear ? he.hidePrevYear : he.showPrevYear}
      </button>

      {showPrevYear && (
        <div className="yearly-section ref-panel">
          <h3>{parseInt(currentYear) - 1} - {he.yearlyGoals}</h3>
          <div className="task-list">
            {(() => {
              const prevYearTasks = getTasksForPeriod('yearly', (parseInt(currentYear) - 1).toString());
              if (prevYearTasks.length === 0) return <p className="empty-msg">{he.noYearlyGoals}</p>;
              return prevYearTasks.filter(t => !t.parentTaskId).map(t => (
                <div key={t.id} className="ref-task">
                  <TaskItem
                    task={t}
                    subtasks={prevYearTasks.filter(s => s.parentTaskId === t.id)}
                    showPullDown={{ label: he.pullToMonthlyFromYearly, targetLevel: 'monthly', targetPeriodKey: currentMonthKey }}
                  />
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Add new yearly task */}
      <div className="yearly-section">
        <h3 className="section-title">{he.yearlyGoals}</h3>
        <TaskCreateForm planLevel="yearly" periodKey={currentYear} />
        <div className="task-list">
          {categories.map(cat => {
            const tasks = groupedByCategory[cat.id];
            if (!tasks || tasks.length === 0) return null;
            return (
              <div key={cat.id} className="category-group">
                <div className="category-header" style={{ color: cat.color }}>
                  <span className="cat-dot" style={{ background: cat.color }} />
                  {cat.name} ({tasks.length})
                </div>
                <div className="category-tasks">
                  {tasks.map(t => (
                    <div key={t.id} className="task-wrapper">
                      <TaskItem task={t} subtasks={getSubtasks(t.id)} />
                      <div className="pull-controls">
                        <button
                          className="btn-text pull-btn"
                          onClick={() => handlePullToMonth(t)}
                        >
                          {he.pullToMonthlyFromYearly}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {topLevelTasks.length === 0 && <p className="empty-msg">{he.noGoalsThisYear}</p>}
    </div>
  );
}
