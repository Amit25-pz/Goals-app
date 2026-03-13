import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DomainRating, Rating } from '../../types';
import { useApp } from '../../context/AppContext';
import { he } from '../../utils/he';
import './DomainRatingPanel.css';

interface Props {
  monthKey: string;
}

const RATING_OPTIONS: { value: Rating; label: string }[] = [
  { value: 'low', label: he.low },
  { value: 'medium', label: he.medium },
  { value: 'high', label: he.high },
];
const RATING_COLORS: Record<Rating, string> = {
  low: '#f38ba8',
  medium: '#f9e2af',
  high: '#a6e3a1',
};

export default function DomainRatingPanel({ monthKey }: Props) {
  const { categories, getDomainRatings, saveDomainRatings } = useApp();
  const [ratings, setRatings] = useState<DomainRating[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setRatings(getDomainRatings(monthKey));
  }, [monthKey, getDomainRatings]);

  const getRating = (categoryId: string): Rating | null => {
    const r = ratings.find(r => r.categoryId === categoryId);
    return r ? r.rating : null;
  };

  const setRating = (categoryId: string, rating: Rating) => {
    let updated = [...ratings];
    const idx = updated.findIndex(r => r.categoryId === categoryId);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], rating };
    } else {
      updated.push({
        id: uuidv4(),
        monthKey,
        categoryId,
        rating,
        createdAt: new Date().toISOString(),
      });
    }
    setRatings(updated);
    saveDomainRatings(monthKey, updated);
  };

  return (
    <div className="domain-rating-panel">
      <div className="panel-header" onClick={() => setCollapsed(!collapsed)}>
        <h3>{he.domainRatings}</h3>
        <span className="toggle">{collapsed ? '+' : '-'}</span>
      </div>
      {!collapsed && (
        <div className="rating-grid">
          {categories.map(cat => (
            <div key={cat.id} className="rating-row">
              <span className="rating-domain" style={{ color: cat.color }}>{cat.name}</span>
              <div className="rating-buttons">
                {RATING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`rating-btn ${getRating(cat.id) === opt.value ? 'active' : ''}`}
                    style={getRating(cat.id) === opt.value ? { background: RATING_COLORS[opt.value] + '33', color: RATING_COLORS[opt.value], borderColor: RATING_COLORS[opt.value] } : {}}
                    onClick={() => setRating(cat.id, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
