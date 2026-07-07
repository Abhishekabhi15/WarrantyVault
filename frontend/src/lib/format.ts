import type { WarrantyStatus } from '@/lib/api';

export function formatCurrency(value: string | null): string {
  if (!value) {
    return 'Not provided';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatWarrantyStatus(status: WarrantyStatus): string {
  if (status === 'expiring_soon') {
    return 'Expiring Soon';
  }
  if (status === 'expired') {
    return 'Expired';
  }
  return 'Active';
}

export function getWarrantyStatusClass(status: WarrantyStatus): string {
  if (status === 'expiring_soon') {
    return 'bg-warning-50 text-warning-700';
  }
  if (status === 'expired') {
    return 'bg-danger-50 text-danger-700';
  }
  return 'bg-success-50 text-success-700';
}

export function formatDaysRemaining(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago`;
  }
  if (daysRemaining === 0) {
    return 'Expires today';
  }
  return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`;
}

export function toReadableError(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
