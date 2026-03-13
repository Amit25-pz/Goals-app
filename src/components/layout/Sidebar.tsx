import { NavLink } from 'react-router-dom';
import { Calendar, CalendarDays, CalendarCheck, BarChart3, Settings, CheckCircle, Lightbulb } from 'lucide-react';
import { he } from '../../utils/he';
import UserSelector from './UserSelector';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>{he.appName}</h1>
      </div>
      <UserSelector />
      <nav className="sidebar-nav">
        <NavLink to="/yearly" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={20} />
          <span>{he.navYearly}</span>
        </NavLink>
        <NavLink to="/monthly" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={20} />
          <span>{he.navMonthly}</span>
        </NavLink>
        <NavLink to="/weekly" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <CalendarDays size={20} />
          <span>{he.navWeekly}</span>
        </NavLink>
        <NavLink to="/daily" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <CalendarCheck size={20} />
          <span>{he.navDaily}</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart3 size={20} />
          <span>{he.navReports}</span>
        </NavLink>
        <NavLink to="/completed" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <CheckCircle size={20} />
          <span>{he.navCompleted}</span>
        </NavLink>
        <NavLink to="/future" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Lightbulb size={20} />
          <span>{he.navFuture}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Settings size={20} />
          <span>{he.navSettings}</span>
        </NavLink>
      </nav>
    </aside>
  );
}
