/**
 * Safe Date Utilities
 * 
 * Provides null-safe date operations to prevent runtime errors
 */

/**
 * Safely format a date to locale string
 * @param {Date|string|number|null} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string}
 */
export function safeToLocaleDateString(date, locale = 'en-US', options = {}, fallback = 'N/A') {
  if (!date) {
    return fallback;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };

    return dateObj.toLocaleDateString(locale, defaultOptions);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Safely format a time to locale string
 * @param {Date|string|number|null} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string}
 */
export function safeToLocaleTimeString(date, locale = 'en-US', options = {}, fallback = 'N/A') {
  if (!date) {
    return fallback;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return dateObj.toLocaleTimeString(locale, defaultOptions);
  } catch (error) {
    console.warn('Error formatting time:', error);
    return fallback;
  }
}

/**
 * Safely format a date and time to locale string
 * @param {Date|string|number|null} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string}
 */
export function safeToLocaleString(date, locale = 'en-US', options = {}, fallback = 'N/A') {
  if (!date) {
    return fallback;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return dateObj.toLocaleString(locale, defaultOptions);
  } catch (error) {
    console.warn('Error formatting date/time:', error);
    return fallback;
  }
}

/**
 * Safely get a relative time string (e.g., "2 hours ago")
 * @param {Date|string|number|null} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string}
 */
export function safeRelativeTime(date, locale = 'en-US', fallback = 'N/A') {
  if (!date) {
    return fallback;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return safeToLocaleDateString(dateObj, locale);
    }
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return fallback;
  }
}

/**
 * Safely check if a date is valid
 * @param {any} date - Value to check
 * @returns {boolean}
 */
export function isValidDate(date) {
  if (!date) {
    return false;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Safely convert Firestore timestamp to Date
 * @param {any} timestamp - Firestore timestamp object
 * @returns {Date|null}
 */
export function safeTimestampToDate(timestamp) {
  if (!timestamp) {
    return null;
  }

  try {
    // Check if it's a Firestore timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    // Check if it has seconds property (Firestore timestamp structure)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }

    // Try to convert directly
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export default {
  safeToLocaleDateString,
  safeToLocaleTimeString,
  safeToLocaleString,
  safeRelativeTime,
  isValidDate,
  safeTimestampToDate,
};

