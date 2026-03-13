# Goals & Schedule Management App - Product Planning Document

## 1. Product Summary

A desktop-first, single-user goals and schedule management web app with three planning layers: **Monthly > Weekly > Daily**. Users set monthly goals rated by life domain, break them into weekly tasks, and manually pull tasks into daily plans. The app tracks completion, generates reports, and supports reflections at each level.

**Stack:** React + TypeScript
**Storage:** localStorage + JSON (with abstraction layer for future migration)
**Week cycle:** Sunday to Saturday (planning happens Saturday evening)
**Domain rating scale:** Low / Medium / High

---

## 2. Scope for v1

### In Scope
- Monthly, weekly, and daily planning views
- 9 default life domains + custom domains
- Domain rating (Low/Med/High) at month start
- Task creation with subtasks
- Pull-down flow (monthly -> weekly -> daily) and promote-up flow (weekly -> monthly)
- Task completion tracking with percentages
- Monthly and weekly reports with PDF export
- Reminder/notification system (browser-based)
- Local-only storage (localStorage + JSON)

### Out of Scope
- Multi-user / collaboration
- Authentication / login
- Cloud sync
- NotebookLM integration
- AI recommendations / smart scheduling
- Mobile-optimized UX
- Automatic task distribution across days

---

## 3. Core User Flows

### 3.1 Start of Month Flow
1. App detects new month (or user navigates to new month)
2. System shows previous month's goals (read-only reference panel)
3. User rates each life domain: Low / Medium / High
4. User creates new monthly goals/tasks, optionally pulling from previous month
5. Goals are organized by life domain; category counts displayed

### 3.2 Weekly Planning Flow (every Saturday)
1. App shows notification/reminder to plan the week
2. Weekly planning view displays three sections:
   - **Monthly tasks** (available to pull down)
   - **Open tasks from previous week** (carry-over candidates)
   - **Current week's task list** (prominently displayed, initially empty)
3. User pulls selected monthly tasks into the weekly plan
4. User can create new weekly tasks; if a new task doesn't exist in monthly, an "Add to Monthly" action is available
5. Category counts displayed for the weekly plan

### 3.3 Daily Planning Flow
1. User opens the daily view for a specific date
2. System shows the weekly task list as a reference panel
3. User manually pulls selected weekly tasks (or subtasks) into the daily list
4. No auto-distribution; purely manual selection
5. User works through daily tasks, marking completions

### 3.4 End of Week Review (Saturday)
1. App shows weekly review popup
2. User sees completed vs. incomplete tasks
3. User can mark additional tasks as complete
4. User writes reflections/progress notes per domain
5. Report is saved (weekly report entity)

### 3.5 End of Month Review
1. App shows monthly report popup
2. User documents progress per domain (text box per domain)
3. User reviews completion stats
4. User can add status updates to individual monthly tasks
5. Report is saved (monthly report entity)

### 3.6 Task Lifecycle
1. Task created at any level (monthly, weekly, daily)
2. Task can be pulled down to lower levels or promoted up
3. Task can be reassigned to a different domain/category
4. Task can have subtasks added
5. Task marked complete -> completion date stored
6. Completed tasks reflected in parent-level stats

---

## 4. Functional Requirements

### 4.1 Task Management
- FR-01: Create tasks with: title, category, description, created date, due date, completion status, completion date
- FR-02: Create subtasks under any task (same fields)
- FR-03: Move tasks between categories/domains
- FR-04: Pull tasks from monthly -> weekly ("Pull to Weekly" action)
- FR-05: Pull tasks from weekly -> daily ("Pull to Daily" action)
- FR-06: Promote tasks from weekly -> monthly ("Add to Monthly" action)
- FR-07: Mark tasks as complete; auto-record completion date
- FR-08: Tasks without a category default to "General"
- FR-09: Subtasks are independently pullable into weekly/daily plans

### 4.2 Monthly Planning
- FR-10: View and create monthly goals organized by domain
- FR-11: Rate each life domain (Low/Medium/High) before defining goals
- FR-12: Display previous month's goals when starting a new month
- FR-13: Pull goals from previous month into current month (with edit capability)
- FR-14: Navigate to any past month's goals (read-only historical view)
- FR-15: Display task count per category for the month
- FR-16: Each monthly task has a text box for status updates
- FR-17: End-of-month review popup with per-domain progress notes

### 4.3 Weekly Planning
- FR-18: Create weekly plan showing: monthly tasks, previous week's open tasks, current week tasks
- FR-19: Current week tasks displayed more prominently than reference panels
- FR-20: Pull selected monthly tasks into weekly plan
- FR-21: "Add to Monthly" action for weekly tasks not in monthly plan
- FR-22: Display task count per category for the week
- FR-23: End-of-week review popup (Saturday) for marking completions

### 4.4 Daily Planning
- FR-24: View daily plan as a list for a specific date
- FR-25: Manually pull tasks/subtasks from weekly into daily
- FR-26: No automatic distribution of weekly tasks across days
- FR-27: Daily completions roll up into weekly performance

### 4.5 Categories/Domains
- FR-28: 9 default categories: Spirituality, Finances, Community, Relationship, Family, Health, Work, Friendships, General
- FR-29: "General" is both a real category and the fallback default
- FR-30: User can create additional custom categories
- FR-31: User can delete custom categories (tasks reassigned to General)

### 4.6 Completion Tracking
- FR-32: Display completion percentage at monthly, weekly, and daily levels
- FR-33: Display completed task count vs. total at each level
- FR-34: Store completion date on every completed task

### 4.7 Reports
- FR-35: Save monthly reports (completion %, completed list, open list, reflections)
- FR-36: Save weekly reports (same structure as monthly)
- FR-37: Daily data is not saved as independent reports
- FR-38: Reports exportable as PDF
- FR-39: Weekly completion can be marked manually OR derived from daily completions

### 4.8 Notifications
- FR-40: Start of month -> reminder to fill monthly goals
- FR-41: Every Saturday -> reminder to plan weekly schedule
- FR-42: End of week (Saturday) -> weekly review popup
- FR-43: End of month -> monthly report popup
- FR-44: Notifications are browser-based (Notification API or in-app banners)

---

## 5. UI / UX Requirements (Desktop-First)

### 5.1 Layout Structure
- **Sidebar navigation**: Month / Week / Day views, Reports, Settings
- **Main content area**: Wide desktop layout, min-width ~1024px
- **Reference panels**: Side panels or collapsible sections for showing parent-level tasks during planning

### 5.2 Task List View (Default)
- List layout showing: task title + category badge
- "+" expand button beneath each task title to reveal description/details
- Checkbox for completion toggle
- Visual indicator for tasks with subtasks

### 5.3 Task Edit Mode
- Table-style inline editing layout
- All fields editable: title, category, description, due date, status
- Subtask management within the edit view

### 5.4 Monthly View
- Domain rating panel at top (Low/Med/High per domain)
- Tasks grouped or filterable by domain
- Category task count summary bar
- Previous month reference panel (collapsible)
- Status update text box per task

### 5.5 Weekly View
- Three-section layout:
  - Left/top panel: Monthly tasks reference (pullable)
  - Left/top panel: Previous week's open tasks (pullable)
  - Main area: Current week's tasks (prominent)
- "Pull to Weekly" button on reference panel items
- "Add to Monthly" button on new weekly tasks
- Category count summary

### 5.6 Daily View
- Single-column task list for the selected date
- Date picker/navigator for switching days
- Side panel: Weekly tasks reference (pullable)
- "Pull to Daily" button on weekly task items

### 5.7 Review/Report Popups
- Modal or full-screen overlay
- Per-domain sections with progress notes text areas
- Completion stats summary at top
- "Export PDF" button

### 5.8 General UI Patterns
- Drag-and-drop not required for v1; button-based pull/promote actions are sufficient
- Consistent color coding per domain/category
- Desktop-optimized: leverage hover states, wide tables, multi-column layouts
- Responsive down to ~1024px; no mobile breakpoints in v1

---

## 6. Data Model / Entities

### 6.1 Category
```
{
  id: string (uuid)
  name: string
  isDefault: boolean       // true for the 9 built-in categories
  color: string            // hex color for UI badges
  sortOrder: number
}
```

### 6.2 DomainRating
```
{
  id: string (uuid)
  monthKey: string         // "2026-03" format
  categoryId: string
  rating: "low" | "medium" | "high"
  createdAt: string (ISO)
}
```

### 6.3 Task
```
{
  id: string (uuid)
  title: string
  categoryId: string       // defaults to General's id
  description: string
  createdAt: string (ISO)
  dueDate: string | null   // ISO date
  isCompleted: boolean
  completedAt: string | null (ISO)
  statusUpdate: string     // free-text status note
  parentTaskId: string | null  // for subtasks
  planLevel: "monthly" | "weekly" | "daily"
  monthKey: string | null  // "2026-03"
  weekKey: string | null   // "2026-W11" (ISO week)
  dayKey: string | null    // "2026-03-15"
  sourceTaskId: string | null  // reference to parent-level task when pulled down
  sortOrder: number
}
```

**Note on task linking:** When a monthly task is pulled to weekly, a new task record is created at the weekly level with `sourceTaskId` pointing to the monthly task. This preserves independence (weekly task can be edited separately) while maintaining traceability. Same pattern for weekly -> daily.

### 6.4 Report
```
{
  id: string (uuid)
  type: "monthly" | "weekly"
  periodKey: string        // "2026-03" or "2026-W11"
  completionPercentage: number
  completedTaskIds: string[]
  openTaskIds: string[]
  domainNotes: { [categoryId: string]: string }  // per-domain reflections
  createdAt: string (ISO)
  updatedAt: string (ISO)
}
```

### 6.5 AppSettings
```
{
  weekStartDay: number     // 0=Sunday (fixed for v1, configurable later)
  notificationsEnabled: boolean
  lastOpenedMonth: string
  lastOpenedWeek: string
}
```

---

## 7. Planning Logic and Task Movement Rules

### 7.1 Pull-Down Rules
| Action | Source | Target | Behavior |
|--------|--------|--------|----------|
| Pull to Weekly | Monthly task | Weekly task | Creates new weekly task linked via `sourceTaskId`. Original monthly task unchanged. |
| Pull to Daily | Weekly task | Daily task | Creates new daily task linked via `sourceTaskId`. Original weekly task unchanged. |
| Pull subtask to Weekly | Monthly subtask | Weekly task | Same as above; subtask becomes a standalone weekly task with link back. |
| Pull subtask to Daily | Weekly subtask | Daily task | Same pattern. |

### 7.2 Promote-Up Rules
| Action | Source | Target | Behavior |
|--------|--------|--------|----------|
| Add to Monthly | Weekly task | Monthly task | Creates new monthly task. Weekly task gets `sourceTaskId` updated to point to it. |

### 7.3 Completion Sync Rules
- When a daily task is marked complete -> check if all daily tasks linked to the same weekly source are complete. If yes, optionally prompt to mark the weekly task complete.
- When a weekly task is marked complete -> same logic upward to monthly.
- Completion at any level is **not** auto-propagated. The user confirms or manually marks parent tasks. The system can suggest/prompt but not auto-complete.

### 7.4 Previous Period Carryover
- **Monthly:** At new month start, previous month's incomplete tasks are shown in a reference panel. User explicitly pulls desired tasks into the new month (creates new task records).
- **Weekly:** At new week start, previous week's incomplete tasks shown in reference panel. Same pull behavior.
- **Daily:** No carryover mechanism. User pulls from weekly each day.

---

## 8. Reporting Logic

### 8.1 Monthly Reports
- **Trigger:** End of month (or user-initiated)
- **Content:** Completion % across all monthly tasks, completed task list, open task list, per-domain written reflections, domain ratings from start of month
- **Storage:** Saved as a Report entity with type "monthly"
- **Editable:** User can update reflections after initial save

### 8.2 Weekly Reports
- **Trigger:** Saturday (end of week) or user-initiated
- **Content:** Completion % for weekly tasks, completed/open lists, per-domain notes
- **Storage:** Saved as Report entity with type "weekly"
- **Completion source:** Tasks pulled into weekly plan and completed at daily or weekly level

### 8.3 Daily Reporting
- No independent daily reports
- Daily completion data is visible in the daily view but rolls up into weekly stats
- Calculation: weekly completion % = (completed weekly-level tasks / total weekly tasks) * 100
  - A weekly task counts as "completed" if marked complete directly OR if all linked daily tasks are complete and user confirms

### 8.4 PDF Export
- Use a client-side PDF library (e.g., jsPDF or react-pdf)
- Export includes: period label, completion stats, task lists, domain notes
- Styled but simple; no complex layouts needed

---

## 9. Notification Logic

### 9.1 Implementation Approach
- Use **in-app banner notifications** as primary mechanism (no dependency on browser Notification API permissions)
- Optionally request browser Notification API permission for background tab alerts

### 9.2 Notification Schedule
| Trigger | Timing | Message |
|---------|--------|---------|
| New month starts | 1st of month, on app open | "It's a new month! Time to set your monthly goals." |
| Weekly planning | Saturday, on app open | "Time to plan your week ahead." |
| Weekly review | Saturday, on app open (if week has tasks) | "Week ending - review your progress." |
| Monthly review | Last day of month, on app open | "Month ending - time for your monthly review." |

### 9.3 Logic
- Notifications are triggered on app open by comparing current date against last acknowledged notification dates (stored in localStorage)
- Each notification is dismissible and shown only once per period
- No background push notifications in v1 (pure web app limitation)

---

## 10. Local Storage Considerations

### 10.1 Storage Strategy
- All data stored as JSON in localStorage
- Data organized by key prefix:
  - `goals_categories` -> Category[]
  - `goals_ratings_{monthKey}` -> DomainRating[]
  - `goals_tasks_{monthKey}` -> Task[] (monthly tasks)
  - `goals_tasks_week_{weekKey}` -> Task[] (weekly tasks)
  - `goals_tasks_day_{dayKey}` -> Task[] (daily tasks)
  - `goals_reports` -> Report[]
  - `goals_settings` -> AppSettings
  - `goals_notifications` -> notification acknowledgment state

### 10.2 Storage Limits
- localStorage limit is ~5MB per origin
- Estimated per-task size: ~500 bytes JSON
- At 50 tasks/month * 12 months = ~600 tasks/year = ~300KB/year
- Reports, ratings, settings add marginal overhead
- **Comfortable for 5+ years of single-user data within 5MB**

### 10.3 Data Abstraction Layer
- All storage access goes through a `StorageService` interface
- Methods: `getTasks(level, periodKey)`, `saveTask(task)`, `getReports(type)`, `saveReport(report)`, etc.
- This abstraction allows future migration to IndexedDB or cloud API without changing app logic

### 10.4 Data Backup
- Provide a "Export All Data" option in Settings (JSON download)
- Provide a "Import Data" option (JSON upload) for backup restoration

---

## 11. Future Mobile-Ready Architecture Notes

### 11.1 Design Principles for Future Portability
- **Component-based architecture:** Small, reusable React components that can be rearranged for mobile layouts
- **Separation of concerns:** Business logic in custom hooks/services, not in UI components
- **Storage abstraction:** `StorageService` interface means swapping to cloud sync or SQLite later requires no app logic changes
- **Responsive foundation:** Use CSS that can be extended with mobile breakpoints later (CSS modules or Tailwind)
- **No desktop-only APIs:** Avoid relying on hover-only interactions for critical actions; use click/tap-friendly targets

### 11.2 Future Migration Path
1. Add mobile breakpoints to existing responsive CSS
2. Swap sidebar nav for bottom tab bar on small screens
3. Replace side-panel reference views with full-screen drill-down on mobile
4. Optionally wrap in Capacitor/Electron for native app distribution
5. Swap `StorageService` implementation for cloud-synced backend

---

## 12. Open Questions / Risks / Assumptions

### Assumptions Made
- **A1:** Week runs Sunday to Saturday. Planning happens Saturday evening for the coming week.
- **A2:** Domain ratings (Low/Med/High) can be edited anytime during the month. An "Edit Ratings" action is available in the monthly view.
- **A3:** Pulling a task down creates a **copy** (linked via sourceTaskId), not a move. The original remains at its level. This allows a monthly goal to be partially addressed across multiple weeks.
- **A4:** A task can be pulled into multiple weeks/days (e.g., recurring weekly work on the same monthly goal). Each pull creates a new linked task.
- **A5:** "General" category cannot be deleted or renamed.
- **A6:** Subtask depth is limited to 1 level (tasks can have subtasks, but subtasks cannot have sub-subtasks).

### Open Questions
- ~~**Q1:** Resolved - ratings are editable anytime.~~
- **Q2:** For the weekly review popup on Saturday - should it appear automatically or only when the user navigates to the weekly view?
- **Q3:** Should completed tasks be visually hidden/archived after the period ends, or always visible in historical views?
- **Q4:** Is there a maximum number of custom categories the user should be allowed to create?

### Risks
- **R1:** localStorage has no built-in query capability. Complex filtering (e.g., "show all incomplete tasks across all months in Health category") requires loading and scanning all data. Mitigated by keeping data volumes small and using in-memory indexing.
- **R2:** localStorage is synchronous and blocks the main thread. For the expected data volume this is negligible, but the StorageService abstraction allows migration to async IndexedDB if needed.
- **R3:** Browser data can be cleared by the user accidentally. The JSON export/import backup feature mitigates this.

---

## Verification Plan

After implementation, verify the app by testing these end-to-end flows:

1. **Monthly setup:** Open app on a simulated "1st of month" -> see notification -> rate domains -> create tasks across categories -> verify counts
2. **Monthly carryover:** Navigate to next month -> see previous month's tasks -> pull some forward -> verify new tasks created
3. **Weekly planning:** Simulate Saturday -> see notification -> see monthly tasks + previous week open -> pull tasks to weekly -> create a new task and "Add to Monthly" -> verify counts
4. **Daily planning:** Open a day -> see weekly reference -> pull tasks -> mark some complete -> verify weekly stats update
5. **Weekly review:** Simulate end-of-week -> review popup -> mark completions -> write notes -> save report
6. **Monthly review:** Simulate end-of-month -> review popup -> write per-domain notes -> save report -> export PDF
7. **Data persistence:** Refresh browser -> verify all data persists
8. **Backup:** Export all data -> clear localStorage -> import data -> verify restoration
