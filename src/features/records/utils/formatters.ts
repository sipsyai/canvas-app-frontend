/**
 * Field Value Formatters
 *
 * Format field values for display in table cells
 */

import { format } from 'date-fns';

/**
 * Format date string to readable format
 * @param dateString - ISO date string or date string
 * @returns Formatted date (e.g., "15 Jan 2026")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    return dateString;
  }
};

/**
 * Format datetime string to readable format
 * @param dateTimeString - ISO datetime string
 * @returns Formatted datetime (e.g., "15 Jan 2026, 14:30")
 */
export const formatDateTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    return format(date, 'dd MMM yyyy, HH:mm');
  } catch (error) {
    return dateTimeString;
  }
};

/**
 * Format phone number
 * Simple formatter (without libphonenumber-js dependency)
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Turkish mobile: 0555 123 45 67
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('90')) {
    // Turkish with country code: +90 555 123 45 67
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  } else if (cleaned.length === 10) {
    // US format: (555) 123-4567
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Fallback: return original
  return phone;
};

/**
 * Format currency value
 * @param value - Numeric value
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format number with thousand separators
 * @param value - Numeric value
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Truncate long text
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format URL for display (remove protocol and trailing slash)
 * @param url - URL string
 * @returns Formatted URL
 */
export const formatUrlForDisplay = (url: string): string => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};
