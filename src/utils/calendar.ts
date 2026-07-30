import { BillItem } from '../types';

/**
 * Generates a direct Google Calendar web link for a bill item.
 */
export function generateGoogleCalendarUrl(bill: BillItem): string {
  const dateObj = new Date(bill.dueDate);
  // Default to 9:00 AM on due date
  const startYear = dateObj.getFullYear();
  const startMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
  const startDay = String(dateObj.getDate()).padStart(2, '0');

  const startDateStr = `${startYear}${startMonth}${startDay}T090000`;
  const endDateStr = `${startYear}${startMonth}${startDay}T100000`;

  const title = encodeURIComponent(`⚡ Bill Due: ${bill.title}`);
  const details = encodeURIComponent(
    `Dinero Bill Reminder:\nPayment due for ${bill.title}.\nAmount: ${bill.currency || 'PHP'} ${bill.amount.toLocaleString()}\nStatus: ${bill.status.toUpperCase()}\n${bill.note ? 'Note: ' + bill.note : ''}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}&add=1`;
}

/**
 * Creates and downloads an .ics (iCalendar) file for a single bill or list of bills.
 * Android, iOS, Windows, and macOS natively import .ics files into Calendar with alarms!
 */
export function downloadBillsIcsFile(bills: BillItem[], filename?: string) {
  if (!bills || bills.length === 0) return;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dinero Financial Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Dinero Bill Reminders',
  ];

  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  bills.forEach((bill) => {
    const dateObj = new Date(bill.dueDate);
    const startYear = dateObj.getFullYear();
    const startMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
    const startDay = String(dateObj.getDate()).padStart(2, '0');
    const dtStart = `${startYear}${startMonth}${startDay}T090000`;
    const dtEnd = `${startYear}${startMonth}${startDay}T100000`;

    const reminderHours = (bill.reminderDaysBefore || 1) * 24;

    lines.push(
      'BEGIN:VEVENT',
      `UID:dinero-bill-${bill.id}@dinerotracker.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:⚡ Bill Due: ${bill.title}`,
      `DESCRIPTION:Dinero Bill Payment due for ${bill.title}. Amount: ${bill.currency || 'PHP'} ${bill.amount}`,
      'STATUS:CONFIRMED',
      // Alarm trigger 1 day before or custom days before
      'BEGIN:VALARM',
      `TRIGGER:-PT${reminderHours}H`,
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${bill.title} bill is due soon!`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Dinero_Bill_Reminders_${new Date().toISOString().slice(0, 10)}.ics`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 2000);
}
