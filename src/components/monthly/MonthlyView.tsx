import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getPreviousMonthKey } from '../../utils/dateHelpers';
import { formatMonthHe, he } from '../../utils/he';
import DomainRatingPanel from './DomainRatingPanel';
import TaskCreateForm from '../shared/TaskCreateForm';
import TaskItem from '../shared/TaskItem';
import CompletionStats from '../shared/CompletionStats';
import CategoryCountBar from '../shared/CategoryCountBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MonthlyView.css';

export default function MonthlyView() {
  const { currentMonthKey, setCurrentMonthKey, getTasksForPeriod, refreshKey } = useApp();

  const [showPrevMonth, setShowPrevMonth] = useState(false);
  const [showYearlyGoals, setShowYearlyGoals] = useState(false);
  const prevMonthKey = getPreviousMonthKey(currentMonthKey);
  const currentYear = currentMonthKey.split('-')[0];

  const tasks = useMemo(() => getTasksForPeriod('monthly', currentMonthKey), [currentMonthKey, refreshKey]);
  const prevTasks = useMemo(() => getTasksForPeriod('monthly', prevMonthKey), [prevMonthKey, refreshKey]);
  const yearlyTasks = useMemo(() => getTasksForPeriod('yearly', currentYear), [currentYear, refreshKey]);
  const topLevelTasks = tasks.filter(t => !t.parentTaskId);
  const topLevelYearlyTasks = yearlyTasks.filter(t => !t.parentTaskId);
  const getSubtasks = (parentId: string) => tasks.filter(t => t.parentTaskId === parentId);
  const getYearlySubtasks = (parentId: string) => yearlyTasks.filter(t => t.parentTaskId === parentId);

  const navigateMonth = (dir: number) => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setCurrentMonthKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="monthly-view">
      <div className="view-header">
        <button className="btn-icon" onClick={() => navigateMonth(1)}><ChevronRight size={20} /></button>
        <h2>{formatMonthHe(currentMonthKey)}</h2>
        <button className="btn-icon" onClick={() => navigateMonth(-1)}><ChevronLeft size={20} /></button>
      </div>

      <DomainRatingPanel monthKey={currentMonthKey} />

      <CompletionStats tasks={tasks} />
      <CategoryCountBar tasks={tasks} />

      <TaskCreateForm planLevel="monthly" monthKey={currentMonthKey} />

      <div className="task-list">
        {topLevelTasks.map(t => (
          <TaskItem key={t.id} task={t} subtasks={getSubtasks(t.id)} />
        ))}
        {topLevelTasks.length === 0 && <p className="empty-msg">{he.noGoalsThisMonth}</p>}
      </div>

      <div className="prev-month-panel">
        <button className="btn-text panel-toggle" onClick={() => setShowPrevMonth(!showPrevMonth)}>
          {showPrevMonth ? he.hidePrevMonth : he.showPrevMonth} ({formatMonthHe(prevMonthKey)})
        </button>
        {showPrevMonth && (
          <div className="prev-task-list">
            {prevTasks.filter(t => !t.parentTaskId).map(t => (
              <TaskItem
                key={t.id}
                task={t}
                subtasks={prevTasks.filter(s => s.parentTaskId === t.id)}
                showPullDown={{ label: he.pullToThisMonth, targetLevel: 'monthly', targetPeriodKey: currentMonthKey }}
              />
            ))}
            {prevTasks.length === 0 && <p className="empty-msg">{he.noPrevMonthGoals}</p>}
          </div>
        )}
      </div>

      <div className="yearly-goals-panel">
        <button className="btn-text panel-toggle" onClick={() => setShowYearlyGoals(!showYearlyGoals)}>
          {showYearlyGoals ? he.hideYearlyGoals : he.showYearlyGoals} ({currentYear})
        </button>
        {showYearlyGoals && (
          <div className="yearly-task-list">
            {topLevelYearlyTasks.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                subtasks={getYearlySubtasks(t.id)}
                showPullDown={{ label: he.pullToMonthlyFromYearly, targetLevel: 'monthly', targetPeriodKey: currentMonthKey }}
              />
            ))}
            {topLevelYearlyTasks.length === 0 && <p className="empty-msg">{he.noYearlyGoals}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
