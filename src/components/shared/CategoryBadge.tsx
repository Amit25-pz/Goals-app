import { useApp } from '../../context/AppContext';

interface Props {
  categoryId: string;
}

export default function CategoryBadge({ categoryId }: Props) {
  const { categories } = useApp();
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return null;

  return (
    <span
      className="category-badge"
      style={{ background: cat.color + '22', color: cat.color, borderColor: cat.color + '44' }}
    >
      {cat.name}
    </span>
  );
}
