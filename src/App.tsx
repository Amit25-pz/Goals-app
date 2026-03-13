import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import YearlyView from './components/yearly/YearlyView';
import MonthlyView from './components/monthly/MonthlyView';
import WeeklyView from './components/weekly/WeeklyView';
import DailyView from './components/daily/DailyView';
import ReportsView from './components/reports/ReportsView';
import CompletedTasksView from './components/completed/CompletedTasksView';
import FutureTasksView from './components/future/FutureTasksView';
import SettingsView from './components/settings/SettingsView';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/yearly" element={<YearlyView />} />
            <Route path="/monthly" element={<MonthlyView />} />
            <Route path="/weekly" element={<WeeklyView />} />
            <Route path="/daily" element={<DailyView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/completed" element={<CompletedTasksView />} />
            <Route path="/future" element={<FutureTasksView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/monthly" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
