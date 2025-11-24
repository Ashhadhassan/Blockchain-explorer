/**
 * Utility Functions
 * Common helper functions used throughout the application
 * @module utils
 */

/**
 * Merge class names (cn = className)
 * Combines Tailwind CSS classes conditionally
 * @param {...(string | undefined | null | false | Record<string, boolean>)} inputs - Class names or conditional objects
 * @returns {string} Combined class string
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}

/**
 * Format a hash string with ellipsis
 * @param {string} hash - Hash string to format
 * @param {number} size - Number of characters to show on each side (default: 6)
 * @returns {string} Formatted hash (e.g., "0x1234…5678")
 */
export const formatHash = (hash: string, size = 6) => {
  if (!hash) return "";
  return `${hash.slice(0, size)}…${hash.slice(-size)}`;
};

/**
 * Format a number with locale-specific formatting
 * @param {number} value - Number to format
 * @param {Intl.NumberFormatOptions} options - Number format options
 * @returns {string} Formatted number string
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  Intl.NumberFormat("en-US", options).format(value);

/**
 * Format a number as currency (USD)
 * @param {number} value - Amount to format
 * @param {Intl.NumberFormatOptions} options - Currency format options
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) =>
  Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    maximumFractionDigits: 2, 
    ...options 
  }).format(value);

/**
 * Format a date/time value
 * @param {string | number | Date} value - Date value to format
 * @returns {string} Formatted date string (e.g., "Jan 1, 2024, 12:00 PM")
 */
export const formatDate = (value: string | number | Date) =>
  new Intl.DateTimeFormat("en-US", { 
    dateStyle: "medium", 
    timeStyle: "short" 
  }).format(new Date(value));
