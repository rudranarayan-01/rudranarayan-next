// lib/exportWorkLog.ts
export interface ExportTask {
  _id: string;
  date?: string;
  title: string;
  details?: string;
  logType?: string;
  techStackUsed?: string[];
  hoursSpent: number;
}

export interface ExportPayment {
  _id: string;
  reason: string;
  projectId: {
    _id: string;
    name: string;
    clientInfo?: { name?: string | null; company?: string | null };
  } | null;
  tasksCovered: ExportTask[];
  timeline: { startDate: string; endDate: string };
}

// Timeline dates are stored as UTC midnight, so format them in UTC
const fmtTimelineDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "-";

// Task dates carry a real time (e.g. 11:28Z), so show them in IST
const fmtTaskDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "-";

const isoDay = (d?: string) => (d ? new Date(d).toISOString().split("T")[0] : "na");
const safeName = (s: string) => s.replace(/[^a-z0-9_-]+/gi, "_");

export async function downloadWorkLogExcel(payment: ExportPayment) {
  // Dynamic import keeps exceljs out of the initial page bundle
  const ExcelJS = (await import("exceljs")).default;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Work Report");

  // Copy before sorting so React state is never mutated. Oldest task first.
  const tasks = [...(payment.tasksCovered ?? [])].sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  );
  const totalHours = tasks.reduce((s, t) => s + (t.hoursSpent || 0), 0);

  ws.columns = [
    { key: "sno", width: 7 },
    { key: "date", width: 14 },
    { key: "title", width: 55 },
    { key: "type", width: 14 },
    { key: "tech", width: 24 },
    { key: "details", width: 60 },
    { key: "hours", width: 12 },
  ];

  // ---- Summary block (no amount) ----
  const info: [string, string | number][] = [
    ["Project", payment.projectId?.name || "Unassigned"],
    ["Client", payment.projectId?.clientInfo?.name || "-"],
    ["Invoice Description", payment.reason || "-"],
    [
      "Period",
      `${fmtTimelineDate(payment.timeline?.startDate)} - ${fmtTimelineDate(payment.timeline?.endDate)}`,
    ],
    ["Total Tasks", tasks.length],
    ["Total Hours", totalHours],
  ];
  info.forEach(([label, value]) => {
    const row = ws.addRow([label, value]);
    row.getCell(1).font = { bold: true };
    ws.mergeCells(`B${row.number}:G${row.number}`);
    row.getCell(2).alignment = { horizontal: "left" };
  });

  ws.addRow([]);

  // ---- Table header ----
  const header = ws.addRow([
    "S.No",
    "Date",
    "Task",
    "Task Type",
    "Tech Stack",
    "Details",
    "Hours Spent",
  ]);
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = { bottom: { style: "thin" } };
  });
  ws.views = [{ state: "frozen", ySplit: header.number }]; // header stays visible while scrolling

  // ---- Task rows ----
  tasks.forEach((t, i) => {
    const row = ws.addRow([
      i + 1,
      fmtTaskDate(t.date),
      t.title?.trim(),
      t.logType || "-",
      t.techStackUsed?.length ? t.techStackUsed.join(", ") : "-",
      t.details?.trim() || "-",
      t.hoursSpent ?? 0,
    ]);
    row.eachCell((c) => (c.alignment = { vertical: "top", wrapText: true }));
    row.getCell(1).alignment = { horizontal: "center", vertical: "top" };
    row.getCell(2).alignment = { horizontal: "center", vertical: "top" };
    row.getCell(4).alignment = { horizontal: "center", vertical: "top" };
    row.getCell(7).alignment = { horizontal: "center", vertical: "top" };
  });

  // ---- Total row ----
  const total = ws.addRow(["", "", "TOTAL", "", "", "", totalHours]);
  total.font = { bold: true };
  total.getCell(7).alignment = { horizontal: "center" };
  total.eachCell((c) => (c.border = { top: { style: "thin" } }));

  // ---- Download in browser ----
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName(payment.projectId?.name || "Project")}_WorkLog_${isoDay(
    payment.timeline?.startDate
  )}_to_${isoDay(payment.timeline?.endDate)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}