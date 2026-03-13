import type { Report, Category, Task } from '../types';
import * as storage from '../services/storageService';
import { he, formatMonthHe, formatWeekHe } from './he';
import { getWeekDateRange } from './dateHelpers';

export function exportReportPDF(report: Report, categories: Category[]) {
  const level = report.type === 'monthly' ? 'monthly' : 'weekly';
  const tasks = storage.getTasks(level as any, report.periodKey);
  const topLevel = tasks.filter((t: Task) => !t.parentTaskId);

  let label: string;
  if (report.type === 'monthly') {
    label = formatMonthHe(report.periodKey);
  } else {
    const { start, end } = getWeekDateRange(report.periodKey);
    label = formatWeekHe(report.periodKey, start, end);
  }

  const typeLabel = report.type === 'monthly' ? he.monthly : he.weekly;

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
  .task-row { font-size: 13px; padding: 2px 10px; }
  .task-completed { color: #16a34a; }
  .task-open { color: #333; }
  .check { color: #16a34a; }
  .circle { color: #999; }
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
      if (t.isCompleted) {
        html += `<div class="task-row task-completed"><span class="check">&#10003;</span> ${t.title}</div>`;
      } else {
        html += `<div class="task-row task-open"><span class="circle">&#9675;</span> ${t.title}</div>`;
      }
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
