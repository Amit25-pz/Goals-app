export type Rating = 'low' | 'medium' | 'high';
export type PlanLevel = 'yearly' | 'monthly' | 'weekly' | 'daily';
export type ReportType = 'monthly' | 'weekly' | 'yearly';

export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  color: string;
  sortOrder: number;
}

export interface DomainRating {
  id: string;
  monthKey: string;
  categoryId: string;
  rating: Rating;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  createdAt: string;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  statusUpdate: string;
  parentTaskId: string | null;
  planLevel: PlanLevel;
  yearKey: string | null; // "2026" format
  monthKey: string | null;
  weekKey: string | null;
  dayKey: string | null;
  assignedDay: string | null; // dayKey assigned within weekly view (for day-of-week scheduling)
  sourceTaskId: string | null;
  sortOrder: number;
}

export interface Report {
  id: string;
  type: ReportType;
  periodKey: string;
  completionPercentage: number;
  completedTaskIds: string[];
  openTaskIds: string[];
  domainNotes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  weekStartDay: number;
  notificationsEnabled: boolean;
  lastOpenedMonth: string;
  lastOpenedWeek: string;
}

export interface NotificationState {
  lastMonthlyReminder: string | null;
  lastWeeklyPlanReminder: string | null;
  lastWeeklyReviewReminder: string | null;
  lastMonthlyReviewReminder: string | null;
}
