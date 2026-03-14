import type { Category, DomainRating, Task, Report, AppSettings, NotificationState, PlanLevel, User } from '../types';
import { DEFAULT_CATEGORIES, GENERAL_CATEGORY_ID } from '../utils/defaults';
import { getMonthKey, getWeekKey } from '../utils/dateHelpers';
import { v4 as uuidv4 } from 'uuid';

// Global keys (not user-scoped)
const GLOBAL_KEYS = {
  users: 'goals_users',
  currentUserId: 'goals_current_user_id',
};

// User-scoped key generators
const getUserKey = (userId: string, suffix: string) => `goals_user_${userId}_${suffix}`;

const KEYS = {
  categories: (userId: string) => getUserKey(userId, 'categories'),
  ratings: (userId: string, monthKey: string) => getUserKey(userId, `ratings_${monthKey}`),
  yearlyTasks: (userId: string, yearKey: string) => getUserKey(userId, `tasks_year_${yearKey}`),
  monthlyTasks: (userId: string, monthKey: string) => getUserKey(userId, `tasks_${monthKey}`),
  weeklyTasks: (userId: string, weekKey: string) => getUserKey(userId, `tasks_week_${weekKey}`),
  dailyTasks: (userId: string, dayKey: string) => getUserKey(userId, `tasks_day_${dayKey}`),
  futureTasks: (userId: string) => getUserKey(userId, 'future_tasks'),
  reports: (userId: string) => getUserKey(userId, 'reports'),
  settings: (userId: string) => getUserKey(userId, 'settings'),
  notifications: (userId: string) => getUserKey(userId, 'notifications'),
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- User Management ---

export function getUsers(): User[] {
  return load<User[]>(GLOBAL_KEYS.users, []);
}

export function getCurrentUserId(): string | null {
  return load<string | null>(GLOBAL_KEYS.currentUserId, null);
}

export function setCurrentUserId(userId: string): void {
  save(GLOBAL_KEYS.currentUserId, userId);
}

export function saveUsers(users: User[]): void {
  save(GLOBAL_KEYS.users, users);
}

export function createUser(name: string): User {
  const user: User = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
  };
  const users = getUsers();
  users.push(user);
  save(GLOBAL_KEYS.users, users);
  return user;
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  save(GLOBAL_KEYS.users, users);
  // Clear all user data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`goals_user_${userId}_`)) {
      localStorage.removeItem(key);
    }
  }
}

export function ensureUserExists(): string {
  let userId = getCurrentUserId();
  if (!userId) {
    const users = getUsers();
    if (users.length === 0) {
      // Create default user
      const user = createUser('משתמש ברירת מחדל');
      userId = user.id;
    } else {
      userId = users[0].id;
    }
    setCurrentUserId(userId);
  }
  return userId;
}

// --- Migration: English -> Hebrew category names ---
const ENGLISH_TO_HEBREW: Record<string, string> = {
  'General': 'כללי',
  'Spirituality': 'רוחניות',
  'Finances': 'כספים',
  'Community': 'קהילה',
  'Relationship': 'זוגיות',
  'Family': 'משפחה',
  'Health': 'בריאות',
  'Work': 'עבודה',
  'Friendships': 'חברויות',
};

function migrateCategoriesToHebrew(userId: string, categories: Category[]): Category[] {
  let changed = false;
  const migrated = categories.map(cat => {
    // Convert English names to Hebrew
    if (cat.isDefault && ENGLISH_TO_HEBREW[cat.name]) {
      changed = true;
      return { ...cat, name: ENGLISH_TO_HEBREW[cat.name] };
    }
    return cat;
  });

  // Check if we're missing any default categories, and replace with fresh defaults if needed
  const hasAllDefaults = DEFAULT_CATEGORIES.every(def =>
    migrated.some(cat => cat.name === def.name && cat.isDefault)
  );

  if (!hasAllDefaults) {
    // Replace all default categories with fresh Hebrew versions
    const customCats = migrated.filter(cat => !cat.isDefault);
    const result = [...DEFAULT_CATEGORIES, ...customCats];
    save(KEYS.categories(userId), result);
    return result;
  }

  if (changed) {
    save(KEYS.categories(userId), migrated);
  }
  return migrated;
}

// --- Categories ---

export function getCategories(userId: string): Category[] {
  const stored = load<Category[] | null>(KEYS.categories(userId), null);
  if (!stored) {
    save(KEYS.categories(userId), DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return migrateCategoriesToHebrew(userId, stored);
}

export function saveCategories(userId: string, categories: Category[]): void {
  save(KEYS.categories(userId), categories);
}

export function getCategoryById(userId: string, id: string): Category | undefined {
  return getCategories(userId).find(c => c.id === id);
}

// --- Domain Ratings ---

export function getDomainRatings(userId: string, monthKey: string): DomainRating[] {
  return load<DomainRating[]>(KEYS.ratings(userId, monthKey), []);
}

export function saveDomainRatings(userId: string, monthKey: string, ratings: DomainRating[]): void {
  save(KEYS.ratings(userId, monthKey), ratings);
}

// --- Tasks ---

function getTaskKey(userId: string, level: PlanLevel, periodKey: string): string {
  switch (level) {
    case 'yearly': return KEYS.yearlyTasks(userId, periodKey);
    case 'monthly': return KEYS.monthlyTasks(userId, periodKey);
    case 'weekly': return KEYS.weeklyTasks(userId, periodKey);
    case 'daily': return KEYS.dailyTasks(userId, periodKey);
  }
}

export function getTasks(userId: string, level: PlanLevel, periodKey: string): Task[] {
  return load<Task[]>(getTaskKey(userId, level, periodKey), []);
}

export function saveTasks(userId: string, level: PlanLevel, periodKey: string, tasks: Task[]): void {
  save(getTaskKey(userId, level, periodKey), tasks);
}

export function saveTask(userId: string, task: Task): void {
  const periodKey = task.planLevel === 'yearly' ? task.yearKey!
    : task.planLevel === 'monthly' ? task.monthKey!
    : task.planLevel === 'weekly' ? task.weekKey!
    : task.dayKey!;
  const tasks = getTasks(userId, task.planLevel, periodKey);
  const idx = tasks.findIndex(t => t.id === task.id);
  if (idx >= 0) {
    tasks[idx] = task;
  } else {
    tasks.push(task);
  }
  saveTasks(userId, task.planLevel, periodKey, tasks);
}

export function deleteTask(userId: string, task: Task): void {
  const periodKey = task.planLevel === 'yearly' ? task.yearKey!
    : task.planLevel === 'monthly' ? task.monthKey!
    : task.planLevel === 'weekly' ? task.weekKey!
    : task.dayKey!;
  const tasks = getTasks(userId, task.planLevel, periodKey).filter(t => t.id !== task.id);
  saveTasks(userId, task.planLevel, periodKey, tasks);
}

export function getSubtasks(userId: string, parentTaskId: string, level: PlanLevel, periodKey: string): Task[] {
  return getTasks(userId, level, periodKey).filter(t => t.parentTaskId === parentTaskId);
}

// --- Reports ---

export function getReports(userId: string): Report[] {
  return load<Report[]>(KEYS.reports(userId), []);
}

export function getReport(userId: string, type: string, periodKey: string): Report | undefined {
  return getReports(userId).find(r => r.type === type && r.periodKey === periodKey);
}

export function saveReport(userId: string, report: Report): void {
  const reports = getReports(userId);
  const idx = reports.findIndex(r => r.id === report.id);
  if (idx >= 0) {
    reports[idx] = report;
  } else {
    reports.push(report);
  }
  save(KEYS.reports(userId), reports);
}

// --- Future Tasks ---

export function getFutureTasks(userId: string): Task[] {
  return load<Task[]>(KEYS.futureTasks(userId), []);
}

export function saveFutureTask(userId: string, task: Task): void {
  const tasks = getFutureTasks(userId);
  const idx = tasks.findIndex(t => t.id === task.id);
  if (idx >= 0) {
    tasks[idx] = task;
  } else {
    tasks.push(task);
  }
  save(KEYS.futureTasks(userId), tasks);
}

export function deleteFutureTask(userId: string, taskId: string): void {
  const tasks = getFutureTasks(userId).filter(t => t.id !== taskId);
  save(KEYS.futureTasks(userId), tasks);
}

// --- Settings ---

export function getSettings(userId: string): AppSettings {
  return load<AppSettings>(KEYS.settings(userId), {
    weekStartDay: 0,
    notificationsEnabled: true,
    lastOpenedMonth: getMonthKey(),
    lastOpenedWeek: getWeekKey(),
  });
}

export function saveSettings(userId: string, settings: AppSettings): void {
  save(KEYS.settings(userId), settings);
}

// --- Notifications ---

export function getNotificationState(userId: string): NotificationState {
  return load<NotificationState>(KEYS.notifications(userId), {
    lastMonthlyReminder: null,
    lastWeeklyPlanReminder: null,
    lastWeeklyReviewReminder: null,
    lastMonthlyReviewReminder: null,
  });
}

export function saveNotificationState(userId: string, state: NotificationState): void {
  save(KEYS.notifications(userId), state);
}

// --- Bulk Export / Import ---

export function exportAllData(): string {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('goals_')) {
      data[key] = JSON.parse(localStorage.getItem(key)!);
    }
  }
  return JSON.stringify(data, null, 2);
}

export function importAllData(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>;
  // Clear existing goals data
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('goals_')) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  // Import new data
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
