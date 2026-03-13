import { useState } from 'react';
import type { Task, PlanLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import CategoryBadge from './CategoryBadge';
import TaskEditForm from './TaskEditForm';
import { he } from '../../utils/he';
import { ChevronDown, ChevronRight, Edit2, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import './TaskItem.css';

interface Props {
  task: Task;
  subtasks?: Task[];
  showPullDown?: { label: string; targetLevel: PlanLevel; targetPeriodKey: string };
  showPromoteUp?: boolean;
  onPulled?: () => void;
}

export default function TaskItem({ task, subtasks = [], showPullDown, showPromoteUp, onPulled }: Props) {
  const { toggleTaskComplete, updateTask, removeTask, pullTaskDown, promoteTaskUp } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showStatusBox, setShowStatusBox] = useState(false);

  const handlePullDown = () => {
    if (showPullDown) {
      pullTaskDown(task, showPullDown.targetLevel, showPullDown.targetPeriodKey);
      onPulled?.();
    }
  };

  const handlePromoteUp = () => {
    promoteTaskUp(task);
    onPulled?.();
  };

  if (editing) {
    return <TaskEditForm task={task} onClose={() => setEditing(false)} />;
  }

  return (
    <div className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
      <div className="task-item-row">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => toggleTaskComplete(task)}
          className="task-checkbox"
        />
        <span className="task-title">{task.title}</span>
        <CategoryBadge categoryId={task.categoryId} />
        <div className="task-actions">
          {showPullDown && (
            <button className="btn-icon btn-pull" onClick={handlePullDown} title={showPullDown.label}>
              <ArrowDown size={14} />
              <span>{showPullDown.label}</span>
            </button>
          )}
          {showPromoteUp && (
            <button className="btn-icon btn-promote" onClick={handlePromoteUp} title={he.addToMonthly}>
              <ArrowUp size={14} />
              <span>{he.addToMonthly}</span>
            </button>
          )}
          <button className="btn-icon" onClick={() => setExpanded(!expanded)} title={he.expand}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <button className="btn-icon" onClick={() => setEditing(true)} title={he.edit}>
            <Edit2 size={14} />
          </button>
          <button className="btn-icon btn-danger" onClick={() => removeTask(task)} title={he.delete}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="task-details">
          {task.description && <p className="task-description">{task.description}</p>}
          {task.dueDate && <p className="task-meta">{he.due} {task.dueDate}</p>}
          {task.completedAt && <p className="task-meta">{he.completedAt} {new Date(task.completedAt).toLocaleDateString('he-IL')}</p>}

          <button className="btn-text" onClick={() => setShowStatusBox(!showStatusBox)}>
            {showStatusBox ? he.hideStatusNote : he.showStatusNote}
          </button>
          {showStatusBox && (
            <textarea
              className="task-status-input"
              value={task.statusUpdate}
              onChange={e => updateTask({ ...task, statusUpdate: e.target.value })}
              placeholder={he.statusUpdate + '...'}
              rows={2}
            />
          )}

          {subtasks.length > 0 && (
            <div className="subtask-list">
              <p className="subtask-label">{he.subtasks}</p>
              {subtasks.map(st => (
                <TaskItem key={st.id} task={st} showPullDown={showPullDown} onPulled={onPulled} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
