import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format time from 24-hour (HH:mm) to 12-hour format (h:mm AM/PM)
 * @param time24 - Time in 24-hour format (e.g., "14:30" or "14:30:00")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime12Hour(time24: string | undefined | null): string {
  if (!time24) return '';
  
  // Remove seconds if present
  const timeParts = time24.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = timeParts[1];
  
  if (isNaN(hours)) return time24;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hours12}:${minutes} ${period}`;
}

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Format date to long format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Monday, January 15, 2024")
 */
export function formatDateLong(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Calculate duration between two times
 * @param startTime - Start time in HH:mm or HH:mm:ss format
 * @param endTime - End time in HH:mm or HH:mm:ss format
 * @returns Formatted duration string (e.g., "2 hours 30 minutes" or "2.5 hours")
 */
export function calculateDuration(startTime: string | undefined | null, endTime: string | undefined | null): string {
  if (!startTime || !endTime) return 'N/A';
  
  try {
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    
    const startMinutes = start[0] * 60 + (start[1] || 0);
    const endMinutes = end[0] * 60 + (end[1] || 0);
    
    const diffMinutes = endMinutes - startMinutes;
    
    if (diffMinutes <= 0) return 'Invalid';
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      // If minutes are 30 or more, show as decimal hours
      if (minutes >= 30) {
        return `${hours + 0.5} hours`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    return 'N/A';
  }
}