import type { Category } from '../types';

export const GENERAL_CATEGORY_ID = 'general-default';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: GENERAL_CATEGORY_ID, name: 'כללי', isDefault: true, color: '#6B7280', sortOrder: 0 },
  { id: 'spirituality-default', name: 'רוחניות', isDefault: true, color: '#8B5CF6', sortOrder: 1 },
  { id: 'finances-default', name: 'כספים', isDefault: true, color: '#10B981', sortOrder: 2 },
  { id: 'community-default', name: 'קהילה', isDefault: true, color: '#F59E0B', sortOrder: 3 },
  { id: 'relationship-default', name: 'זוגיות', isDefault: true, color: '#EF4444', sortOrder: 4 },
  { id: 'family-default', name: 'משפחה', isDefault: true, color: '#EC4899', sortOrder: 5 },
  { id: 'health-default', name: 'בריאות', isDefault: true, color: '#14B8A6', sortOrder: 6 },
  { id: 'work-default', name: 'עבודה', isDefault: true, color: '#3B82F6', sortOrder: 7 },
  { id: 'friendships-default', name: 'חברויות', isDefault: true, color: '#F97316', sortOrder: 8 },
];
