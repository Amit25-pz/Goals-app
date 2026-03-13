export const he = {
  // App
  appName: 'יעדים',

  // Navigation
  navYearly: 'שנתי',
  navMonthly: 'חודשי',
  navWeekly: 'שבועי',
  navDaily: 'יומי',
  navReports: 'דוחות',
  navSettings: 'הגדרות',
  navCompleted: 'משימות שהושלמו',

  // User Management
  selectUser: 'בחר משתמש',
  addUser: 'הוסף משתמש',
  userNamePlaceholder: 'שם המשתמש...',
  deleteUser: 'מחק משתמש',
  confirmDeleteUser: 'בטוח שברצונך למחוק את המשתמש הנוכחי? כל הנתונים שלו יימחקו.',
  create: 'צור',

  // Common
  add: 'הוסף',
  save: 'שמור',
  cancel: 'ביטול',
  confirm: 'אישור',
  delete: 'מחק',
  edit: 'עריכה',
  close: 'סגור',
  more: 'עוד',
  less: 'פחות',
  expand: 'הרחב',
  completed: 'הושלם',
  open: 'פתוח',
  today: 'היום',
  goToToday: 'חזור להיום',
  noTasks: 'אין משימות עדיין.',

  // Categories
  general: 'כללי',
  spirituality: 'רוחניות',
  finances: 'כספים',
  community: 'קהילה',
  relationship: 'זוגיות',
  family: 'משפחה',
  health: 'בריאות',
  work: 'עבודה',
  friendships: 'חברויות',
  defaultBadge: 'ברירת מחדל',

  // Domain Ratings
  domainRatings: 'דירוג תחומי חיים',
  low: 'נמוך',
  medium: 'בינוני',
  high: 'גבוה',

  // Task actions
  pullToMonthly: 'העבר לחודשי',
  pullToWeekly: 'העבר לשבועי',
  pullToDaily: 'העבר ליומי',
  pullToThisMonth: 'העבר לחודש זה',
  addToMonthly: 'הוסף לחודשי',
  addNewTask: 'הוסף משימה חדשה...',
  addSubtask: 'הוסף תת-משימה...',
  statusNote: 'הערת סטטוס',
  showStatusNote: 'הוסף הערת סטטוס',
  hideStatusNote: 'הסתר הערת סטטוס',
  subtasks: 'תתי-משימות:',
  statusUpdate: 'עדכון סטטוס',

  // Task fields
  title: 'כותרת',
  category: 'תחום',
  description: 'תיאור',
  dueDate: 'תאריך יעד',
  completedAt: 'הושלם בתאריך:',
  due: 'יעד:',

  // Yearly
  yearlyGoals: 'יעדים שנתיים',
  noGoalsThisYear: 'אין יעדים לשנה זו. הוסף יעד חדש למעלה.',
  pullToMonthlyFromYearly: 'העבר לחודשי',
  yearlyTasksRef: 'יעדים שנתיים',
  showYearlyGoals: 'הצג יעדים שנתיים',
  hideYearlyGoals: 'הסתר יעדים שנתיים',
  noYearlyGoals: 'אין יעדים שנתיים.',

  // Monthly
  monthlyGoals: 'יעדים חודשיים',
  noGoalsThisMonth: 'אין יעדים לחודש זה. הוסף יעד חדש למעלה.',
  showPrevMonth: 'הצג חודש קודם',
  hidePrevMonth: 'הסתר חודש קודם',
  noPrevMonthGoals: 'אין יעדים מהחודש הקודם.',
  showPrevYear: 'הצג שנה קודמת',
  hidePrevYear: 'הסתר שנה קודמת',
  hide: 'הסתר',
  completedStats: (completed: number, total: number, pct: number) =>
    `${completed}/${total} הושלמו (${pct}%)`,

  // Weekly
  thisWeekTasks: 'משימות השבוע',
  monthlyGoalsRef: 'יעדים חודשיים',
  showMonthlyGoals: 'הצג יעדים חודשיים',
  hideMonthlyGoals: 'הסתר יעדים חודשיים',
  prevWeekOpen: 'משימות פתוחות משבוע קודם',
  showPrevWeek: 'הצג שבוע קודם',
  hidePrevWeek: 'הסתר שבוע קודם',
  noPrevWeekTasks: 'אין משימות פתוחות מהשבוע הקודם.',
  noMonthlyGoals: 'אין יעדים חודשיים.',
  noWeeklyTasks: 'אין משימות עדיין. העבר מהחודשי או צור חדשות.',
  assignToDay: 'שבץ ליום',
  unassigned: 'לא שובצו ליום',

  // Days of week
  sunday: 'ראשון',
  monday: 'שני',
  tuesday: 'שלישי',
  wednesday: 'רביעי',
  thursday: 'חמישי',
  friday: 'שישי',
  saturday: 'שבת',
  daysOfWeek: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as string[],

  // Daily
  todaysTasks: 'משימות היום',
  weeklyTasksRef: 'משימות שבועיות',
  noWeeklyTasksRef: 'אין משימות שבועיות.',
  noDailyTasks: 'אין משימות עדיין. משימות מהשבוע יופיעו אוטומטית, או העבר ידנית.',
  autoFromWeekly: 'אוטומטי מהשבועי',
  manualTasks: 'משימות ידניות',
  pullFromOtherDay: 'העבר מיום אחר',
  pushToDay: 'העבר ליום אחר',
  moveToDay: 'העבר ליום:',

  // Completed tasks
  totalCompleted: 'סה"כ הושלמו',
  noCompletedTasks: 'אין משימות שהושלמו עדיין.',
  planLevelLabel: (level: string) => {
    if (level === 'monthly') return 'חודשי';
    if (level === 'weekly') return 'שבועי';
    return 'יומי';
  },

  // Future tasks
  navFuture: 'משימות עתידיות',
  futureTasksTitle: 'משימות עתידיות',
  futureTasksDesc: 'רשימת רעיונות ומשימות עתידיות שניתן לדחוף לתוכנית השנתית, חודשית או שבועית',
  noFutureTasks: 'אין משימות עתידיות עדיין.',
  pushToYear: 'דחוף לשנה',
  pushToMonth: 'דחוף לחודש',
  pushToWeek: 'דחוף לשבוע',
  selectTargetMonth: 'בחר חודש יעד',
  selectTargetWeek: 'בחר שבוע יעד',

  // Reports
  reports: 'דוחות',
  monthly: 'חודשי',
  weekly: 'שבועי',
  generateReport: (type: string) => `צור דוח ${type} לתקופה הנוכחית`,
  savedReports: 'דוחות שמורים',
  noReports: (type: string) => `אין דוחות ${type} עדיין.`,
  exportPDF: 'ייצוא PDF',
  pdfReportTitle: (type: string) => `דוח ${type}`,
  pdfCompletion: (pct: number) => `אחוז השלמה: ${pct}%`,
  pdfCompleted: (n: number) => `הושלמו: ${n}`,
  pdfOpen: (n: number) => `פתוחות: ${n}`,
  pdfTasksByDomain: 'משימות לפי תחום:',
  pdfReflections: 'סיכום לפי תחום:',
  completionPct: 'אחוז השלמה',
  completedTasks: 'משימות שהושלמו',
  openTasks: 'משימות פתוחות',
  domainReflections: 'סיכום לפי תחום',
  reflectionPlaceholder: (name: string) => `סיכום עבור ${name}...`,
  tasksByDomain: 'משימות לפי תחום',

  // Settings
  settings: 'הגדרות',
  categoriesSettings: 'תחומי חיים / קטגוריות',
  newCategoryPlaceholder: 'שם קטגוריה חדשה...',
  dataManagement: 'ניהול נתונים',
  exportData: 'ייצוא כל הנתונים (JSON)',
  importData: 'ייבוא נתונים',
  importSuccess: 'הנתונים יובאו בהצלחה. רענן כדי לראות את כל השינויים.',
  importFailed: 'הייבוא נכשל. פורמט קובץ לא תקין.',

  // Notifications
  newMonthReminder: 'חודש חדש! הגיע הזמן לקבוע יעדים חודשיים.',
  weeklyPlanReminder: 'הגיע הזמן לתכנן את השבוע הקרוב.',
  weeklyReviewReminder: 'השבוע מסתיים - סקור את ההתקדמות שלך.',
  monthlyReviewReminder: 'החודש מסתיים - הגיע הזמן לסיכום חודשי.',

  // Hebrew months
  months: [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
  ] as string[],
};

export function formatMonthHe(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${he.months[m - 1]} ${y}`;
}

export function formatWeekHe(weekKey: string, start: Date, end: Date): string {
  return `שבוע ${weekKey.split('-W')[1]} (${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()})`;
}

export function formatDayHe(dayKey: string): string {
  const d = new Date(dayKey);
  const dayName = he.daysOfWeek[d.getDay()];
  const [y, m, day] = dayKey.split('-').map(Number);
  return `יום ${dayName}, ${day} ${he.months[m - 1]} ${y}`;
}
