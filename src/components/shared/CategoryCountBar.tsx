import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import './CategoryCountBar.css';

interface Props {
  tasks: Task[];
}

export default function CategoryCountBar({ tasks }: Props) {
  const { categories } = useApp();
  const topLevel = tasks.filter(t => !t.parentTaskId);

  const counts = categories.map(cat => ({
    category: cat,
    count: topLevel.filter(t => t.categoryId === cat.id).length,
  })).filter(c => c.count > 0);

  if (counts.length === 0) return null;

  return (
    <div className="category-count-bar">
      {counts.map(({ category, count }) => (
        <span key={category.id} className="category-count-chip" style={{ background: category.color + '22', color: category.color }}>
          {category.name}: {count}
        </span>
      ))}
    </div>
  );
}
