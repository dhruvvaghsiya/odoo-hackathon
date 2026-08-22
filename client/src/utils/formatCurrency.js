/**
 * Format currency with symbol and separators
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '—';

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    THB: '฿',
    BRL: 'R$',
    ARS: 'AR$',
    PEN: 'S/',
    ZAR: 'R',
    MAD: 'MAD',
    AED: 'AED',
    TRY: '₺',
    NZD: 'NZ$',
    IDR: 'Rp',
    VND: '₫',
    KRW: '₩',
    MXN: 'MX$',
  };

  const symbol = symbols[currency] || currency + ' ';

  // No decimals for JPY, KRW, VND, IDR
  const noDecimals = ['JPY', 'KRW', 'VND', 'IDR'].includes(currency);

  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  });

  return `${symbol}${formatted}`;
}

/**
 * Format a compact number (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '—';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
