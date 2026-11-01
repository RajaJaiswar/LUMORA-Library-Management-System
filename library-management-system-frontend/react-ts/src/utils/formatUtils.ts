/**
 * Shared formatting utilities for dates, currency, and relative loan status.
 */

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    let date: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [yearStr, monthStr, dayStr] = dateString.split('-');
      date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
    } else {
      date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString?: string | null): string {
  if (!dateTimeString) return '—';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateTimeString;
  }
}

export function formatCurrency(amount?: number | null): string {
  if (amount === null || amount === undefined || amount === 0) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getDueStatus(dueDateString: string, isReturned: boolean = false): {
  isOverdue: boolean;
  isDueSoon: boolean;
  days: number;
  text: string;
} {
  if (isReturned) {
    return {
      isOverdue: false,
      isDueSoon: false,
      days: 0,
      text: 'Returned',
    };
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let due: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDateString)) {
      const [yearStr, monthStr, dayStr] = dueDateString.split('-');
      due = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
    } else {
      due = new Date(dueDateString);
    }
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        isOverdue: true,
        isDueSoon: false,
        days: overdueDays,
        text: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`,
      };
    } else if (diffDays === 0) {
      return {
        isOverdue: false,
        isDueSoon: true,
        days: 0,
        text: 'Due today',
      };
    } else {
      return {
        isOverdue: false,
        isDueSoon: diffDays <= 3,
        days: diffDays,
        text: `${diffDays} day${diffDays === 1 ? '' : 's'} left`,
      };
    }
  } catch {
    return {
      isOverdue: false,
      isDueSoon: false,
      days: 0,
      text: dueDateString,
    };
  }
}

/**
 * Safely parse a YYYY-MM-DD string, add days, and return a new YYYY-MM-DD string.
 * Avoids browser timezone offsets.
 */
export function addDaysToDateString(dateString: string, daysToAdd: number): string {
  try {
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const d = new Date(year, month, day);
    d.setDate(d.getDate() + daysToAdd);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${dayOfMonth}`;
  } catch {
    return dateString;
  }
}
