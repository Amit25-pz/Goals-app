import type { Report, Category, Task } from '../types';
import * as storage from '../services/storageService';
import { he, formatMonthHe, formatWeekHe } from './he';
import { getWeekDateRange } from './dateHelpers';

export function exportReportPDF(report: Report, categories: Category[], userId?: string) {
  const level = report.type === 'monthly' ? 'monthly' : report.type === 'weekly' ? 'weekly' : 'yearly';
  const tasks = userId ? storage.getTasks(userId, level as any, report.periodKey) : storage.getTasks(level as any, report.periodKey);
  const topLevel = tasks.filter((t: Task) => !t.parentTaskId);

  let label: string;
  if (report.type === 'monthly') {
    label = formatMonthHe(report.periodKey);
  } else if (report.type === 'weekly') {
    const { start, end } = getWeekDateRange(report.periodKey);
    label = formatWeekHe(report.periodKey, start, end);
  } else {
    label = `${he.yearlyGoals} ${report.periodKey}`;
  }

  const typeLabel = report.type === 'monthly' ? he.monthly : report.type === 'weekly' ? he.weekly : he.yearlyGoals;

  // Build HTML content
  let html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8" />
<title>${he.pdfReportTitle(typeLabel)} - ${label}</title>
<style>
  body { font-family: Arial, 'Segoe UI', sans-serif; direction: rtl; padding: 40px; color: #1a1a2e; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  h2 { font-size: 18px; color: #444; margin-top: 24px; margin-bottom: 8px; }
  .subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
  .stats { font-size: 14px; margin-bottom: 16px; color: #333; }
  .domain-group { margin-bottom: 16px; padding: 10px; background: #f8f8f8; border-radius: 6px; }
  .domain-name { font-weight: bold; font-size: 14px; margin-bottom: 6px; }
  .task-row { font-size: 13px; padding: 8px 10px; border-bottom: 1px solid #eee; }
  .task-title { font-weight: bold; display: block; margin-bottom: 4px; }
  .task-completed { color: #16a34a; }
  .task-open { color: #333; }
  .check { color: #16a34a; }
  .circle { color: #999; }
  .task-details { font-size: 12px; color: #666; margin-left: 20px; }
  .task-detail-line { margin: 2px 0; }
  .reflections { margin-top: 20px; }
  .reflection-item { margin-bottom: 8px; font-size: 13px; }
  .reflection-domain { font-weight: bold; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <h1>${he.pdfReportTitle(typeLabel)}</h1>
  <div class="subtitle">${label}</div>
  <div class="stats">
    ${he.pdfCompletion(report.completionPercentage)} &nbsp;|&nbsp;
    ${he.pdfCompleted(report.completedTaskIds.length)} &nbsp;|&nbsp;
    ${he.pdfOpen(report.openTaskIds.length)}
  </div>

  <h2>${he.pdfTasksByDomain}</h2>`;

  for (const cat of categories) {
    const catTasks = topLevel.filter((t: Task) => t.categoryId === cat.id);
    if (catTasks.length === 0) continue;

    html += `
  <div class="domain-group">
    <div class="domain-name" style="color: ${cat.color}">${cat.name} (${catTasks.length})</div>`;

    for (const t of catTasks) {
      const statusClass = t.isCompleted ? 'task-completed' : 'task-open';
      const statusIcon = t.isCompleted ? '&#10003;' : '&#9675;';
      html += `<div class="task-row ${statusClass}">
        <span style="font-weight: bold;"><span class="${t.isCompleted ? 'check' : 'circle'}">${statusIcon}</span> ${t.title}</span>
        <div class="task-details">`;

      if (t.description) {
        html += `<div class="task-detail-line"><strong>${he.description}:</strong> ${t.description}</div>`;
      }
      if (t.dueDate) {
        html += `<div class="task-detail-line"><strong>${he.dueDate}:</strong> ${new Date(t.dueDate).toLocaleDateString('he-IL')}</div>`;
      }
      if (t.isCompleted && t.completedAt) {
        html += `<div class="task-detail-line"><strong>${he.completedAt}</strong> ${new Date(t.completedAt).toLocaleDateString('he-IL')}</div>`;
      }
      if (t.statusUpdate) {
        html += `<div class="task-detail-line"><strong>${he.statusNote}:</strong> ${t.statusUpdate}</div>`;
      }

      html += `</div></div>`;
    }
    html += `</div>`;
  }

  // Reflections
  const hasNotes = categories.some(cat => report.domainNotes[cat.id]);
  if (hasNotes) {
    html += `<h2>${he.pdfReflections}</h2><div class="reflections">`;
    for (const cat of categories) {
      const note = report.domainNotes[cat.id];
      if (note) {
        html += `<div class="reflection-item"><span class="reflection-domain" style="color: ${cat.color}">${cat.name}:</span> ${note}</div>`;
      }
    }
    html += `</div>`;
  }

  html += `</body></html>`;

  // Open in new window and trigger print (which allows Save as PDF)
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Small delay to let content render before printing
    setTimeout(() => printWindow.print(), 300);
  }
}

export function exportCompletedTasksPDF(completedTasks: Task[], categories: Category[]) {
  // Group by completion month
  const groupedByMonth: Record<string, Task[]> = {};
  completedTasks.forEach(t => {
    if (!t.completedAt) return;
    const month = t.completedAt.substring(0, 7);
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(t);
  });

  let html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8" />
<title>${he.navCompleted}</title>
<style>
  body { font-family: Arial, 'Segoe UI', sans-serif; direction: rtl; padding: 40px; color: #1a1a2e; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  h2 { font-size: 18px; color: #444; margin-top: 24px; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
  .month-group { margin-bottom: 20px; }
  .month-header { font-weight: bold; font-size: 16px; padding: 8px; background: #f0f0f0; margin-bottom: 8px; }
  .task-row { font-size: 13px; padding: 10px; border-bottom: 1px solid #eee; background: #fafafa; }
  .task-title { font-weight: bold; display: block; margin-bottom: 4px; }
  .task-details { font-size: 12px; color: #666; margin-left: 20px; }
  .task-detail-line { margin: 2px 0; }
  .task-category { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-right: 8px; }
  .task-level { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 11px; background: #e0e0e0; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <h1>${he.navCompleted}</h1>
  <div class="subtitle">${he.totalCompleted}: ${completedTasks.length}</div>`;

  // Sort months newest first
  const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

  for (const month of sortedMonths) {
    const monthTasks = groupedByMonth[month];
    const monthDate = new Date(month + '-01');
    const monthLabel = monthDate.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });

    html += `
  <div class="month-group">
    <div class="month-header">${monthLabel} (${monthTasks.length})</div>`;

    for (const t of monthTasks) {
      const cat = categories.find(c => c.id === t.categoryId);
      html += `
    <div class="task-row">
      <span class="task-title">✓ ${t.title}</span>
      <div class="task-details">`;

      if (cat) {
        html += `<div class="task-detail-line"><span class="task-category" style="background: ${cat.color}33; color: ${cat.color}">${cat.name}</span><span class="task-level">${he.planLevelLabel(t.planLevel)}</span></div>`;
      }

      if (t.description) {
        html += `<div class="task-detail-line"><strong>${he.description}:</strong> ${t.description}</div>`;
      }
      if (t.dueDate) {
        html += `<div class="task-detail-line"><strong>${he.dueDate}:</strong> ${new Date(t.dueDate).toLocaleDateString('he-IL')}</div>`;
      }
      if (t.completedAt) {
        html += `<div class="task-detail-line"><strong>${he.completedAt}</strong> ${new Date(t.completedAt).toLocaleDateString('he-IL')}</div>`;
      }
      if (t.statusUpdate) {
        html += `<div class="task-detail-line"><strong>${he.statusNote}:</strong> ${t.statusUpdate}</div>`;
      }

      html += `</div></div>`;
    }

    html += `</div>`;
  }

  html += `</body></html>`;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
}
