import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getDayKey, getWeekDateRange } from '../../utils/dateHelpers';
import { formatDayHe, he } from '../../utils/he';
import { addDays, subDays, format } from 'date-fns';
import * as storage from '../../services/storageService';
import TaskCreateForm from '../shared/TaskCreateForm';
import TaskItem from '../shared/TaskItem';
import CompletionStats from '../shared/CompletionStats';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DailyView.css';

export default function DailyView() {
  const { currentDayKey, setCurrentDayKey, currentWeekKey, getTasksForPeriod, refreshKey, updateTask, triggerRefresh } = useApp();
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  const dailyTasks = useMemo(() => getTasksForPeriod('daily', currentDayKey), [currentDayKey, refreshKey]);
  const weeklyTasks = useMemo(() => getTasksForPeriod('weekly', currentWeekKey), [currentWeekKey, refreshKey]);

  const autoWeeklyTasks = useMemo(() => {
    return weeklyTasks.filter(t => !t.parentTaskId && t.assignedDay === currentDayKey);
  }, [weeklyTasks, currentDayKey]);

  const otherWeeklyTasks = useMemo(() => {
    return weeklyTasks.filter(t => !t.parentTaskId && t.assignedDay !== currentDayKey);
  }, [weeklyTasks, currentDayKey]);

  const manualDailyTasks = dailyTasks.filter(t => !t.parentTaskId);
  const getSubtasks = (parentId: string) => dailyTasks.filter(t => t.parentTaskId === parentId);

  const allDayTasks = [...autoWeeklyTasks, ...manualDailyTasks];

  const weekDays = useMemo(() => {
    const { start } = getWeekDateRange(currentWeekKey);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const dayKey = format(date, 'yyyy-MM-dd');
      return { dayKey, dayName: he.daysOfWeek[i], date };
    });
  }, [currentWeekKey]);

  const navigateDay = (dir: number) => {
    const current = new Date(currentDayKey);
    const next = dir > 0 ? addDays(current, 1) : subDays(current, 1);
    setCurrentDayKey(getDayKey(next));
  };

  // Move a weekly task (auto-pulled) to a different day
  const handleMoveWeeklyTask = (task: typeof weeklyTasks[0], targetDayKey: string) => {
    updateTask({ ...task, assignedDay: targetDayKey });
    setMovingTaskId(null);
  };

  // Move a daily task to a different day
  const handleMoveDailyTask = (task: typeof dailyTasks[0], targetDayKey: string) => {
    // Remove from current day storage
    const currentTasks = storage.getTasks('daily', currentDayKey).filter(t => t.id !== task.id);
    storage.saveTasks('daily', currentDayKey, currentTasks);
    // Save to target day storage
    const movedTask = { ...task, dayKey: targetDayKey };
    storage.saveTask(movedTask);
    triggerRefresh();
    setMovingTaskId(null);
  };

  const isToday = currentDayKey === getDayKey();

  return (
    <div className="daily-view">
      <div className="view-header">
        <button className="btn-icon" onClick={() => navigateDay(1)}><ChevronRight size={20} /></button>
        <h2>{formatDayHe(currentDayKey)} {isToday && <span className="today-badge">{he.today}</span>}</h2>
        <button className="btn-icon" onClick={() => navigateDay(-1)}><ChevronLeft size={20} /></button>
        {!isToday && (
          <button className="btn btn-secondary" onClick={() => setCurrentDayKey(getDayKey())}>{he.goToToday}</button>
        )}
      </div>

      <CompletionStats tasks={allDayTasks} />

      {/* Auto-pulled tasks from weekly (assigned to this day) */}
      {autoWeeklyTasks.length > 0 && (
        <div className="daily-section">
          <h3 className="section-title auto-title">{he.autoFromWeekly}</h3>
          <div className="task-list">
            {autoWeeklyTasks.map(t => (
              <div key={t.id} className="daily-task-wrapper">
                <TaskItem
                  task={t}
                  subtasks={weeklyTasks.filter(s => s.parentTaskId === t.id)}
                />
                <div className="push-day-controls">
                  <button className="btn-text push-btn" onClick={() => setMovingTaskId(movingTaskId === t.id ? null : t.id)}>
                    {he.pushToDay}
                  </button>
                  {movingTaskId === t.id && (
                    <div className="day-picker-row">
                      <span className="assign-label">{he.moveToDay}</span>
                      {weekDays.filter(d => d.dayKey !== currentDayKey).map(d => (
                        <button key={d.dayKey} className="assign-day-btn" onClick={() => handleMoveWeeklyTask(t, d.dayKey)}>
                          {d.dayName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual daily tasks */}
      <div className="daily-section">
        <h3 className="section-title">{he.manualTasks}</h3>
        <TaskCreateForm planLevel="daily" dayKey={currentDayKey} />
        <div className="task-list">
          {manualDailyTasks.map(t => (
            <div key={t.id} className="daily-task-wrapper">
              <TaskItem task={t} subtasks={getSubtasks(t.id)} />
              <div className="push-day-controls">
                <button className="btn-text push-btn" onClick={() => setMovingTaskId(movingTaskId === t.id ? null : t.id)}>
                  {he.pushToDay}
                </button>
                {movingTaskId === t.id && (
                  <div className="day-picker-row">
                    <span className="assign-label">{he.moveToDay}</span>
                    {weekDays.filter(d => d.dayKey !== currentDayKey).map(d => (
                      <button key={d.dayKey} className="assign-day-btn" onClick={() => handleMoveDailyTask(t, d.dayKey)}>
                        {d.dayName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly reference for manual pulling */}
      <div className="daily-section">
        <h3 className="section-title">{he.pullFromOtherDay}</h3>
        <div className="ref-panel">
          <div className="ref-task-list">
            {otherWeeklyTasks.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                subtasks={weeklyTasks.filter(s => s.parentTaskId === t.id)}
                showPullDown={{ label: he.pullToDaily, targetLevel: 'daily', targetPeriodKey: currentDayKey }}
              />
            ))}
            {otherWeeklyTasks.length === 0 && <p className="empty-msg">{he.noWeeklyTasksRef}</p>}
          </div>
        </div>
      </div>

      {allDayTasks.length === 0 && <p className="empty-msg">{he.noDailyTasks}</p>}
    </div>
  );
}
