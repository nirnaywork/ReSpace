/**
 * Format a number as Indian Rupee currency
 * @param {number} amount
 * @returns {string} e.g., "₹1,00,000"
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};

/**
 * Format price with unit
 * @param {number} amount
 * @param {string} type - "hour" | "day" | "week"
 * @returns {string} e.g., "₹500/hour"
 */
export const formatPriceWithUnit = (amount, type) => {
  return `${formatPrice(amount)}/${type}`;
};

/**
 * Calculate platform fee (5%)
 */
export const calcPlatformFee = (amount) => Math.round(amount * 0.05);

/**
 * Calculate total with platform fee
 */
export const calcTotal = (amount) => Math.round(amount + calcPlatformFee(amount));
