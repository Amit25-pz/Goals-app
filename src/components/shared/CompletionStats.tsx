import type { Task } from '../../types';
import { he } from '../../utils/he';
import './CompletionStats.css';

interface Props {
  tasks: Task[];
}

export default function CompletionStats({ tasks }: Props) {
  const total = tasks.filter(t => !t.parentTaskId).length;
  const completed = tasks.filter(t => !t.parentTaskId && t.isCompleted).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="completion-stats">
      <div className="completion-bar-track">
        <div className="completion-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="completion-text">{he.completedStats(completed, total, pct)}</span>
    </div>
  );
}
