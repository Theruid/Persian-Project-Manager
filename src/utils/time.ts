import { toPersianNumbers } from './numbers';

export function formatDuration(start: string, end: string | null): string {
  if (!end) return 'در حال انجام';
  const duration = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${toPersianNumbers(hours)}:${toPersianNumbers(parseInt(minutes.toString().padStart(2, '0')))}`;
}