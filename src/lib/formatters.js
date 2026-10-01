const WEEKDAYS_MN = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

const parseDate = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

// Pure Y-M-D math, independent of the browser's timezone
export const addDays = (dateString, days) => {
  const dt = parseDate(dateString);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

// "10-р сарын 1, Пүрэв"
export const formatDateMn = (dateString) => {
  const dt = parseDate(dateString);
  return `${dt.getUTCMonth() + 1}-р сарын ${dt.getUTCDate()}, ${WEEKDAYS_MN[dt.getUTCDay()]}`;
};

export const formatMoney = (amount) => `₮${(amount || 0).toLocaleString()}`;
