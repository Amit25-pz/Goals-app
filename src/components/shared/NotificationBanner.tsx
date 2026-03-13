import { useState, useEffect } from 'react';
import { getNotificationState, saveNotificationState } from '../../services/storageService';
import { getMonthKey, getWeekKey, isFirstOfMonth, isSaturday, isLastDayOfMonth } from '../../utils/dateHelpers';
import { he } from '../../utils/he';
import { X } from 'lucide-react';
import './NotificationBanner.css';

interface Notification {
  id: string;
  message: string;
}

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const now = new Date();
    const state = getNotificationState();
    const currentMonth = getMonthKey(now);
    const currentWeek = getWeekKey(now);
    const pending: Notification[] = [];

    if (isFirstOfMonth(now) && state.lastMonthlyReminder !== currentMonth) {
      pending.push({ id: 'monthly', message: he.newMonthReminder });
    }
    if (isSaturday(now) && state.lastWeeklyPlanReminder !== currentWeek) {
      pending.push({ id: 'weekly-plan', message: he.weeklyPlanReminder });
    }
    if (isSaturday(now) && state.lastWeeklyReviewReminder !== currentWeek) {
      pending.push({ id: 'weekly-review', message: he.weeklyReviewReminder });
    }
    if (isLastDayOfMonth(now) && state.lastMonthlyReviewReminder !== currentMonth) {
      pending.push({ id: 'monthly-review', message: he.monthlyReviewReminder });
    }

    setNotifications(pending);
  }, []);

  const dismiss = (id: string) => {
    const state = getNotificationState();
    const now = new Date();
    if (id === 'monthly') state.lastMonthlyReminder = getMonthKey(now);
    if (id === 'weekly-plan') state.lastWeeklyPlanReminder = getWeekKey(now);
    if (id === 'weekly-review') state.lastWeeklyReviewReminder = getWeekKey(now);
    if (id === 'monthly-review') state.lastMonthlyReviewReminder = getMonthKey(now);
    saveNotificationState(state);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-banners">
      {notifications.map(n => (
        <div key={n.id} className="notification-banner">
          <span>{n.message}</span>
          <button onClick={() => dismiss(n.id)} className="btn-icon"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}
