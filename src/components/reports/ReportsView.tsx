import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Report, ReportType, Task } from '../../types';
import { useApp } from '../../context/AppContext';
import * as storage from '../../services/storageService';
import { formatMonthHe, formatWeekHe, he } from '../../utils/he';
import { getWeekDateRange } from '../../utils/dateHelpers';
import { exportReportPDF } from '../../utils/exportPdf';
import { FileText, Download, Plus } from 'lucide-react';
import './ReportsView.css';

export default function ReportsView() {
  const { categories, currentMonthKey, currentWeekKey, currentUser, getTasksForPeriod, refreshKey } = useApp();
  const [activeTab, setActiveTab] = useState<ReportType>('monthly');
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const currentYear = currentMonthKey.split('-')[0];

  const reports = useMemo(() => {
    if (!currentUser) return [];
    return storage.getReports(currentUser.id).filter(r => r.type === activeTab).sort((a, b) => b.periodKey.localeCompare(a.periodKey));
  }, [activeTab, refreshKey, editingReport, currentUser]);

  // Get tasks for current report period
  const reportTasks = useMemo(() => {
    if (!editingReport) return [];
    const level = editingReport.type === 'monthly' ? 'monthly' : editingReport.type === 'weekly' ? 'weekly' : 'yearly';
    return getTasksForPeriod(level as any, editingReport.periodKey);
  }, [editingReport, refreshKey]);

  // Group tasks by domain
  const tasksByDomain = useMemo(() => {
    const grouped: Record<string, { completed: Task[]; open: Task[] }> = {};
    categories.forEach(cat => { grouped[cat.id] = { completed: [], open: [] }; });
    reportTasks.filter(t => !t.parentTaskId).forEach(t => {
      if (!grouped[t.categoryId]) grouped[t.categoryId] = { completed: [], open: [] };
      if (t.isCompleted) {
        grouped[t.categoryId].completed.push(t);
      } else {
        grouped[t.categoryId].open.push(t);
      }
    });
    return grouped;
  }, [reportTasks, categories]);

  const generateReport = () => {
    if (!currentUser) return;
    let periodKey: string;
    let level: 'monthly' | 'weekly' | 'yearly';

    if (activeTab === 'monthly') {
      periodKey = currentMonthKey;
      level = 'monthly';
    } else if (activeTab === 'weekly') {
      periodKey = currentWeekKey;
      level = 'weekly';
    } else {
      periodKey = currentYear;
      level = 'yearly';
    }

    const tasks = getTasksForPeriod(level, periodKey);
    const topLevel = tasks.filter(t => !t.parentTaskId);
    const completed = topLevel.filter(t => t.isCompleted);
    const open = topLevel.filter(t => !t.isCompleted);

    const existing = storage.getReport(currentUser.id, activeTab, periodKey);
    const report: Report = existing ? {
      ...existing,
      completionPercentage: topLevel.length === 0 ? 0 : Math.round((completed.length / topLevel.length) * 100),
      completedTaskIds: completed.map(t => t.id),
      openTaskIds: open.map(t => t.id),
      updatedAt: new Date().toISOString(),
    } : {
      id: uuidv4(),
      type: activeTab,
      periodKey,
      completionPercentage: topLevel.length === 0 ? 0 : Math.round((completed.length / topLevel.length) * 100),
      completedTaskIds: completed.map(t => t.id),
      openTaskIds: open.map(t => t.id),
      domainNotes: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveReport(currentUser.id, report);
    setEditingReport(report);
  };

  const updateDomainNote = (categoryId: string, note: string) => {
    if (!editingReport || !currentUser) return;
    const updated = {
      ...editingReport,
      domainNotes: { ...editingReport.domainNotes, [categoryId]: note },
      updatedAt: new Date().toISOString(),
    };
    setEditingReport(updated);
    storage.saveReport(currentUser.id, updated);
  };

  const formatLabel = (report: Report) => {
    if (report.type === 'monthly') return formatMonthHe(report.periodKey);
    if (report.type === 'weekly') {
      const { start, end } = getWeekDateRange(report.periodKey);
      return formatWeekHe(report.periodKey, start, end);
    }
    return `${he.yearlyGoals} ${report.periodKey}`;
  };

  const exportPDF = (report: Report) => {
    exportReportPDF(report, categories);
  };

  return (
    <div className="reports-view">
      <h2>{he.reports}</h2>
      <div className="report-tabs">
        <button className={`tab ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => { setActiveTab('monthly'); setEditingReport(null); }}>{he.monthly}</button>
        <button className={`tab ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => { setActiveTab('weekly'); setEditingReport(null); }}>{he.weekly}</button>
        <button className={`tab ${activeTab === 'yearly' ? 'active' : ''}`} onClick={() => { setActiveTab('yearly'); setEditingReport(null); }}>{he.yearlyGoals}</button>
      </div>

      <button className="btn btn-primary" onClick={generateReport}>
        <Plus size={14} /> {he.generateReport(activeTab === 'monthly' ? he.monthly : activeTab === 'weekly' ? he.weekly : he.yearlyGoals)}
      </button>

      {editingReport && (
        <div className="report-editor">
          <h3>
            {formatLabel(editingReport)}
            <span className="report-pct">{editingReport.completionPercentage}% {he.completed}</span>
          </h3>
          <p className="report-stats">
            {editingReport.completedTaskIds.length} {he.completedTasks}, {editingReport.openTaskIds.length} {he.openTasks}
          </p>

          {/* Feature #5: Tasks by domain with status */}
          <div className="tasks-by-domain">
            <h4>{he.tasksByDomain}</h4>
            {categories.map(cat => {
              const domainData = tasksByDomain[cat.id];
              if (!domainData || (domainData.completed.length === 0 && domainData.open.length === 0)) return null;
              return (
                <div key={cat.id} className="domain-task-group">
                  <div className="domain-group-header" style={{ color: cat.color }}>
                    {cat.name} ({domainData.completed.length + domainData.open.length})
                  </div>
                  <div className="domain-task-list">
                    {domainData.completed.map(t => (
                      <div key={t.id} className="domain-task-item completed-item">
                        <span className="task-status-icon">&#10003;</span>
                        <span>{t.title}</span>
                      </div>
                    ))}
                    {domainData.open.map(t => (
                      <div key={t.id} className="domain-task-item open-item">
                        <span className="task-status-icon">&#9675;</span>
                        <span>{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Domain reflections */}
          <h4>{he.domainReflections}</h4>
          <div className="domain-notes-grid">
            {categories.map(cat => (
              <div key={cat.id} className="domain-note">
                <label style={{ color: cat.color }}>{cat.name}</label>
                <textarea
                  value={editingReport.domainNotes[cat.id] || ''}
                  onChange={e => updateDomainNote(cat.id, e.target.value)}
                  placeholder={he.reflectionPlaceholder(cat.name)}
                  rows={2}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={() => exportPDF(editingReport)}>
            <Download size={14} /> {he.exportPDF}
          </button>
        </div>
      )}

      <div className="report-list">
        <h3>{he.savedReports}</h3>
        {reports.map(r => (
          <div key={r.id} className="report-card" onClick={() => setEditingReport(r)}>
            <FileText size={16} />
            <span>{formatLabel(r)}</span>
            <span className="report-pct">{r.completionPercentage}%</span>
            <button className="btn-icon" onClick={e => { e.stopPropagation(); exportPDF(r); }}><Download size={14} /></button>
          </div>
        ))}
        {reports.length === 0 && <p className="empty-msg">{he.noReports(activeTab === 'monthly' ? he.monthly : activeTab === 'weekly' ? he.weekly : he.yearlyGoals)}</p>}
      </div>
    </div>
  );
}
