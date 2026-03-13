import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getPreviousWeekKey, getWeekDateRange } from '../../utils/dateHelpers';
import { formatMonthHe, he } from '../../utils/he';
import { format, addDays } from 'date-fns';
import TaskCreateForm from '../shared/TaskCreateForm';
import TaskItem from '../shared/TaskItem';
import CompletionStats from '../shared/CompletionStats';
import CategoryCountBar from '../shared/CategoryCountBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './WeeklyView.css';

export default function WeeklyView() {
  const { currentWeekKey, setCurrentWeekKey, currentMonthKey, getTasksForPeriod, refreshKey, updateTask } = useApp();

  const [showMonthlyRef, setShowMonthlyRef] = useState(true);
  const [showPrevWeek, setShowPrevWeek] = useState(false);
  const [addingForDay, setAddingForDay] = useState<string | null>(null);
  const prevWeekKey = getPreviousWeekKey(currentWeekKey);

  const weekTasks = useMemo(() => getTasksForPeriod('weekly', currentWeekKey), [currentWeekKey, refreshKey]);
  const monthlyTasks = useMemo(() => getTasksForPeriod('monthly', currentMonthKey), [currentMonthKey, refreshKey]);
  const prevWeekTasks = useMemo(() => getTasksForPeriod('weekly', prevWeekKey), [prevWeekKey, refreshKey]);

  const openPrevTasks = prevWeekTasks.filter(t => !t.parentTaskId && !t.isCompleted);

  // Get the days of the current week (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const { start } = getWeekDateRange(currentWeekKey);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const dayKey = format(date, 'yyyy-MM-dd');
      return { dayKey, dayName: he.daysOfWeek[i], date };
    });
  }, [currentWeekKey]);

  // Group tasks by assigned day
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, typeof weekTasks> = { unassigned: [] };
    weekDays.forEach(d => { grouped[d.dayKey] = []; });
    weekTasks.filter(t => !t.parentTaskId).forEach(t => {
      if (t.assignedDay && grouped[t.assignedDay]) {
        grouped[t.assignedDay].push(t);
      } else {
        grouped['unassigned'].push(t);
      }
    });
    return grouped;
  }, [weekTasks, weekDays]);

  const getSubtasks = (parentId: string) => weekTasks.filter(t => t.parentTaskId === parentId);

  const navigateWeek = (dir: number) => {
    const [yearStr, weekStr] = currentWeekKey.split('-W');
    let year = parseInt(yearStr);
    let week = parseInt(weekStr) + dir;
    if (week < 1) { year--; week = 52; }
    if (week > 52) { year++; week = 1; }
    setCurrentWeekKey(`${year}-W${String(week).padStart(2, '0')}`);
  };

  const assignTaskToDay = (task: typeof weekTasks[0], dayKey: string) => {
    updateTask({ ...task, assignedDay: dayKey });
  };

  const unassignTask = (task: typeof weekTasks[0]) => {
    updateTask({ ...task, assignedDay: null });
  };

  const weekLabel = useMemo(() => {
    const { start, end } = getWeekDateRange(currentWeekKey);
    return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
  }, [currentWeekKey]);

  return (
    <div className="weekly-view">
      <div className="view-header">
        <button className="btn-icon" onClick={() => navigateWeek(1)}><ChevronRight size={20} /></button>
        <h2>{currentWeekKey} <span className="week-range">{weekLabel}</span></h2>
        <button className="btn-icon" onClick={() => navigateWeek(-1)}><ChevronLeft size={20} /></button>
      </div>

      <div className="weekly-top-layout">
        {/* Monthly goals reference with titles */}
        <div className="ref-panel">
          <button className="panel-toggle btn-text" onClick={() => setShowMonthlyRef(!showMonthlyRef)}>
            {showMonthlyRef ? he.hideMonthlyGoals : he.showMonthlyGoals} ({formatMonthHe(currentMonthKey)})
          </button>
          {showMonthlyRef && (
            <div className="ref-task-list">
              {monthlyTasks.filter(t => !t.parentTaskId).map(t => (
                <TaskItem
                  key={t.id}
                  task={t}
                  subtasks={monthlyTasks.filter(s => s.parentTaskId === t.id)}
                  showPullDown={{ label: he.pullToWeekly, targetLevel: 'weekly', targetPeriodKey: currentWeekKey }}
                />
              ))}
              {monthlyTasks.length === 0 && <p className="empty-msg">{he.noMonthlyGoals}</p>}
            </div>
          )}
        </div>

        <div className="ref-panel">
          <button className="panel-toggle btn-text" onClick={() => setShowPrevWeek(!showPrevWeek)}>
            {showPrevWeek ? he.hidePrevWeek : he.showPrevWeek} ({openPrevTasks.length})
          </button>
          {showPrevWeek && (
            <div className="ref-task-list">
              {openPrevTasks.map(t => (
                <TaskItem
                  key={t.id}
                  task={t}
                  showPullDown={{ label: he.pullToWeekly, targetLevel: 'weekly', targetPeriodKey: currentWeekKey }}
                />
              ))}
              {openPrevTasks.length === 0 && <p className="empty-msg">{he.noPrevWeekTasks}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Weekly stats */}
      <div className="weekly-main-section">
        <h3>{he.thisWeekTasks}</h3>
        <CompletionStats tasks={weekTasks} />
        <CategoryCountBar tasks={weekTasks} />
      </div>

      {/* General task form - above unassigned */}
      <div className="weekly-general-add">
        <TaskCreateForm planLevel="weekly" weekKey={currentWeekKey} />
      </div>

      {/* Unassigned tasks */}
      {tasksByDay['unassigned'].length > 0 && (
        <div className="day-column unassigned-column">
          <div className="day-header">
            <span className="day-name">{he.unassigned}</span>
          </div>
          {tasksByDay['unassigned'].map(t => (
            <div key={t.id} className="day-task-wrapper">
              <TaskItem task={t} subtasks={getSubtasks(t.id)} showPromoteUp={!t.sourceTaskId} />
              <div className="assign-day-row">
                <span className="assign-label">{he.assignToDay}:</span>
                {weekDays.map(d => (
                  <button key={d.dayKey} className="assign-day-btn" onClick={() => assignTaskToDay(t, d.dayKey)}>
                    {d.dayName}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Day columns */}
      <div className="week-days-grid">
        {weekDays.map(day => (
          <div key={day.dayKey} className="day-column">
            <div className="day-header">
              <span className="day-name">{day.dayName}</span>
              <span className="day-date">{format(day.date, 'dd/MM')}</span>
              <span className="day-count">{(tasksByDay[day.dayKey] || []).length}</span>
            </div>
            <div className="day-tasks">
              {(tasksByDay[day.dayKey] || []).map(t => (
                <div key={t.id} className="day-task-wrapper">
                  <TaskItem task={t} subtasks={getSubtasks(t.id)} showPromoteUp={!t.sourceTaskId} />
                  <button className="btn-text unassign-btn" onClick={() => unassignTask(t)}>
                    הסר מיום
                  </button>
                </div>
              ))}
              {addingForDay === day.dayKey ? (
                <TaskCreateForm
                  planLevel="weekly"
                  weekKey={currentWeekKey}
                  assignedDay={day.dayKey}
                  onCreated={() => setAddingForDay(null)}
                />
              ) : (
                <button className="btn-text add-to-day-btn" onClick={() => setAddingForDay(day.dayKey)}>
                  + {he.addNewTask}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
