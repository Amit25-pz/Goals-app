import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Category, Task, DomainRating, PlanLevel, User } from '../types';
import * as storage from '../services/storageService';
import { getMonthKey, getWeekKey, getDayKey } from '../utils/dateHelpers';
import { v4 as uuidv4 } from 'uuid';
import { GENERAL_CATEGORY_ID } from '../utils/defaults';

interface AppContextValue {
  // User management
  currentUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
  createNewUser: (name: string) => void;
  deleteCurrentUser: () => void;

  categories: Category[];
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  refreshCategories: () => void;

  currentMonthKey: string;
  currentWeekKey: string;
  currentDayKey: string;
  setCurrentMonthKey: (key: string) => void;
  setCurrentWeekKey: (key: string) => void;
  setCurrentDayKey: (key: string) => void;

  getTasksForPeriod: (level: PlanLevel, periodKey: string) => Task[];
  createTask: (params: {
    title: string;
    categoryId?: string;
    description?: string;
    dueDate?: string | null;
    planLevel: PlanLevel;
    yearKey?: string | null;
    monthKey?: string | null;
    weekKey?: string | null;
    dayKey?: string | null;
    assignedDay?: string | null;
    parentTaskId?: string | null;
    sourceTaskId?: string | null;
  }) => Task;
  updateTask: (task: Task) => void;
  removeTask: (task: Task) => void;
  toggleTaskComplete: (task: Task) => void;
  pullTaskDown: (task: Task, targetLevel: PlanLevel, targetPeriodKey: string) => Task;
  promoteTaskUp: (task: Task) => Task;

  getDomainRatings: (monthKey: string) => DomainRating[];
  saveDomainRatings: (monthKey: string, ratings: DomainRating[]) => void;

  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize user
  const [currentUserId, setCurrentUserId] = useState<string>(() => storage.ensureUserExists());
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const currentUser = users.find(u => u.id === currentUserId) || null;

  const [categories, setCategories] = useState<Category[]>(storage.getCategories(currentUserId));
  const [currentMonthKey, setCurrentMonthKey] = useState(getMonthKey());
  const [currentWeekKey, setCurrentWeekKey] = useState(getWeekKey());
  const [currentDayKey, setCurrentDayKey] = useState(getDayKey());
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  // User management
  const switchUser = useCallback((userId: string) => {
    storage.setCurrentUserId(userId);
    setCurrentUserId(userId);
    setCategories(storage.getCategories(userId));
    triggerRefresh();
  }, [triggerRefresh]);

  const createNewUser = useCallback((name: string) => {
    const user = storage.createUser(name);
    setUsers(storage.getUsers());
    switchUser(user.id);
  }, [switchUser]);

  const deleteCurrentUser = useCallback(() => {
    if (currentUserId && users.length > 1) {
      storage.deleteUser(currentUserId);
      setUsers(storage.getUsers());
      const remainingUsers = storage.getUsers();
      if (remainingUsers.length > 0) {
        switchUser(remainingUsers[0].id);
      }
    }
  }, [currentUserId, users.length, switchUser]);

  const refreshCategories = useCallback(() => {
    setCategories(storage.getCategories(currentUserId));
  }, [currentUserId]);

  const addCategory = useCallback((name: string, color: string) => {
    const cats = storage.getCategories(currentUserId);
    const newCat: Category = {
      id: uuidv4(),
      name,
      isDefault: false,
      color,
      sortOrder: cats.length,
    };
    cats.push(newCat);
    storage.saveCategories(currentUserId, cats);
    setCategories(cats);
  }, [currentUserId]);

  const deleteCategory = useCallback((id: string) => {
    const cats = storage.getCategories(currentUserId).filter(c => c.id !== id);
    storage.saveCategories(currentUserId, cats);
    setCategories(cats);
  }, [currentUserId]);

  const getTasksForPeriod = useCallback((level: PlanLevel, periodKey: string): Task[] => {
    return storage.getTasks(currentUserId, level, periodKey);
  }, [currentUserId, refreshKey]);

  const createTask = useCallback((params: {
    title: string;
    categoryId?: string;
    description?: string;
    dueDate?: string | null;
    planLevel: PlanLevel;
    yearKey?: string | null;
    monthKey?: string | null;
    weekKey?: string | null;
    dayKey?: string | null;
    assignedDay?: string | null;
    parentTaskId?: string | null;
    sourceTaskId?: string | null;
  }): Task => {
    const existing = params.planLevel === 'yearly'
      ? storage.getTasks(currentUserId, 'yearly', params.yearKey || new Date().getFullYear().toString())
      : params.planLevel === 'monthly'
      ? storage.getTasks(currentUserId, 'monthly', params.monthKey || currentMonthKey)
      : params.planLevel === 'weekly'
      ? storage.getTasks(currentUserId, 'weekly', params.weekKey || currentWeekKey)
      : storage.getTasks(currentUserId, 'daily', params.dayKey || currentDayKey);

    const task: Task = {
      id: uuidv4(),
      title: params.title,
      categoryId: params.categoryId || GENERAL_CATEGORY_ID,
      description: params.description || '',
      createdAt: new Date().toISOString(),
      dueDate: params.dueDate || null,
      isCompleted: false,
      completedAt: null,
      statusUpdate: '',
      parentTaskId: params.parentTaskId || null,
      planLevel: params.planLevel,
      yearKey: params.yearKey !== undefined ? params.yearKey : (params.planLevel === 'yearly' ? new Date().getFullYear().toString() : null),
      monthKey: params.monthKey !== undefined ? params.monthKey : (params.planLevel === 'monthly' ? currentMonthKey : null),
      weekKey: params.weekKey !== undefined ? params.weekKey : (params.planLevel === 'weekly' ? currentWeekKey : null),
      dayKey: params.dayKey !== undefined ? params.dayKey : (params.planLevel === 'daily' ? currentDayKey : null),
      assignedDay: params.assignedDay || null,
      sourceTaskId: params.sourceTaskId || null,
      sortOrder: existing.length,
    };
    storage.saveTask(currentUserId, task);
    triggerRefresh();
    return task;
  }, [currentUserId, currentMonthKey, currentWeekKey, currentDayKey, triggerRefresh]);

  const updateTask = useCallback((task: Task) => {
    storage.saveTask(currentUserId, task);
    triggerRefresh();
  }, [currentUserId, triggerRefresh]);

  const removeTask = useCallback((task: Task) => {
    storage.deleteTask(currentUserId, task);
    triggerRefresh();
  }, [currentUserId, triggerRefresh]);

  // Feature #4: When completing a daily task, also mark the linked weekly task complete
  const toggleTaskComplete = useCallback((task: Task) => {
    const nowCompleted = !task.isCompleted;
    const updated: Task = {
      ...task,
      isCompleted: nowCompleted,
      completedAt: nowCompleted ? new Date().toISOString() : null,
    };
    storage.saveTask(currentUserId, updated);

    // If completing a daily task that was pulled from weekly, mark the weekly source complete too
    if (nowCompleted && task.planLevel === 'daily' && task.sourceTaskId) {
      // Find the weekly source task
      const weekKeys = findWeekKeyForTask(task.sourceTaskId);
      if (weekKeys) {
        const weeklyTasks = storage.getTasks(currentUserId, 'weekly', weekKeys);
        const weeklyTask = weeklyTasks.find(t => t.id === task.sourceTaskId);
        if (weeklyTask && !weeklyTask.isCompleted) {
          const updatedWeekly: Task = {
            ...weeklyTask,
            isCompleted: true,
            completedAt: new Date().toISOString(),
          };
          storage.saveTask(currentUserId, updatedWeekly);

          // Also check if weekly source has a monthly source
          if (updatedWeekly.sourceTaskId) {
            const monthKey = findMonthKeyForTask(updatedWeekly.sourceTaskId);
            if (monthKey) {
              const monthlyTasks = storage.getTasks(currentUserId, 'monthly', monthKey);
              const monthlyTask = monthlyTasks.find(t => t.id === updatedWeekly.sourceTaskId);
              if (monthlyTask && !monthlyTask.isCompleted) {
                // Check if ALL weekly tasks linked to this monthly task are completed
                // For now, don't auto-complete monthly - only weekly
              }
            }
          }
        }
      }
    }

    // If un-completing a daily task, also un-complete the weekly source
    if (!nowCompleted && task.planLevel === 'daily' && task.sourceTaskId) {
      const weekKeys = findWeekKeyForTask(task.sourceTaskId);
      if (weekKeys) {
        const weeklyTasks = storage.getTasks(currentUserId, 'weekly', weekKeys);
        const weeklyTask = weeklyTasks.find(t => t.id === task.sourceTaskId);
        if (weeklyTask && weeklyTask.isCompleted) {
          const updatedWeekly: Task = {
            ...weeklyTask,
            isCompleted: false,
            completedAt: null,
          };
          storage.saveTask(currentUserId, updatedWeekly);
        }
      }
    }

    triggerRefresh();
  }, [currentUserId, triggerRefresh]);

  const pullTaskDown = useCallback((task: Task, targetLevel: PlanLevel, targetPeriodKey: string): Task => {
    const newTask = createTask({
      title: task.title,
      categoryId: task.categoryId,
      description: task.description,
      dueDate: task.dueDate,
      planLevel: targetLevel,
      yearKey: targetLevel === 'yearly' ? targetPeriodKey : null,
      monthKey: targetLevel === 'monthly' ? targetPeriodKey : null,
      weekKey: targetLevel === 'weekly' ? targetPeriodKey : null,
      dayKey: targetLevel === 'daily' ? targetPeriodKey : null,
      sourceTaskId: task.id,
    });
    return newTask;
  }, [createTask]);

  const promoteTaskUp = useCallback((task: Task): Task => {
    const monthlyTask = createTask({
      title: task.title,
      categoryId: task.categoryId,
      description: task.description,
      dueDate: task.dueDate,
      planLevel: 'monthly',
      monthKey: currentMonthKey,
    });
    const updated = { ...task, sourceTaskId: monthlyTask.id };
    storage.saveTask(currentUserId, updated);
    triggerRefresh();
    return monthlyTask;
  }, [createTask, currentUserId, currentMonthKey, triggerRefresh]);

  const getDomainRatingsForMonth = useCallback((monthKey: string) => {
    return storage.getDomainRatings(currentUserId, monthKey);
  }, [currentUserId, refreshKey]);

  const saveDomainRatingsForMonth = useCallback((monthKey: string, ratings: DomainRating[]) => {
    storage.saveDomainRatings(currentUserId, monthKey, ratings);
    triggerRefresh();
  }, [currentUserId, triggerRefresh]);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      switchUser,
      createNewUser,
      deleteCurrentUser,
      categories,
      addCategory,
      deleteCategory,
      refreshCategories,
      currentMonthKey,
      currentWeekKey,
      currentDayKey,
      setCurrentMonthKey,
      setCurrentWeekKey,
      setCurrentDayKey,
      getTasksForPeriod,
      createTask,
      updateTask,
      removeTask,
      toggleTaskComplete,
      pullTaskDown,
      promoteTaskUp,
      getDomainRatings: getDomainRatingsForMonth,
      saveDomainRatings: saveDomainRatingsForMonth,
      refreshKey,
      triggerRefresh,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Helper: find the weekKey that contains a specific task ID
function findWeekKeyForTask(userId: string, taskId: string): string | null {
  const prefix = `goals_user_${userId}_tasks_week_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      try {
        const tasks: Task[] = JSON.parse(localStorage.getItem(key)!);
        if (tasks.some(t => t.id === taskId)) {
          return key.replace(prefix, '');
        }
      } catch { /* skip invalid JSON */ }
    }
  }
  return null;
}

function findMonthKeyForTask(userId: string, taskId: string): string | null {
  const prefix = `goals_user_${userId}_tasks_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix) && !key.includes('week_') && !key.includes('day_') && !key.includes('year_')) {
      try {
        const tasks: Task[] = JSON.parse(localStorage.getItem(key)!);
        if (tasks.some(t => t.id === taskId)) {
          return key.replace(prefix, '');
        }
      } catch { /* skip invalid JSON */ }
    }
  }
  return null;
}
