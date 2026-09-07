/**
 * Dịch vụ Quản lý Sổ Nhật Ký Giao Hàng & Thu Nhập Lũy Kế
 * Hỗ trợ lưu trữ theo từng ngày, tính lương cứng + công đơn và lọc thông minh
 */

const STORAGE_LOGS_KEY = 'shipper_daily_logs_v1';

/**
 * Lấy toàn bộ nhật ký giao hàng các ngày từ localStorage
 */
export function getDailyLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Lỗi đọc nhật ký giao hàng:', e);
  }
  return [];
}

/**
 * Lưu hoặc cập nhật ca giao hàng của một ngày vào Sổ Nhật Ký
 */
export function saveDailyLog({
  date = new Date().toISOString().split('T')[0],
  shipperName = 'Shipper Pro',
  carrier = 'J&T Express',
  orders = [],
  shippingWage = 4500,
  baseSalary = 5000000
}) {
  const logs = getDailyLogs();
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const failedOrders = orders.filter((o) => o.status === 'failed');

  const deliveredCount = deliveredOrders.length;
  const failedCount = failedOrders.length;
  const totalOrders = orders.length;

  const totalCOD = deliveredOrders.reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);
  const totalTip = deliveredOrders.reduce((sum, o) => sum + (Number(o.tipAmount) || 0), 0);
  const totalWageEarned = deliveredCount * shippingWage;

  const newLogEntry = {
    id: 'log-' + date,
    date, // YYYY-MM-DD
    timestamp: Date.now(),
    shipperName,
    carrier,
    totalOrders,
    deliveredCount,
    failedCount,
    totalCOD,
    shippingWage,
    totalWageEarned,
    totalTip,
    baseSalary,
    totalIncome: baseSalary + totalWageEarned + totalTip,
    orders
  };

  const existingIndex = logs.findIndex((l) => l.date === date);
  if (existingIndex >= 0) {
    logs[existingIndex] = newLogEntry;
  } else {
    logs.unshift(newLogEntry);
  }

  try {
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Lỗi lưu nhật ký giao hàng:', e);
  }

  return newLogEntry;
}

/**
 * Lọc thông minh theo khoảng thời gian
 */
export function filterLogs(logs, filterType = 'all', customStartDate = '', customEndDate = '') {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return logs.filter((log) => {
    if (!log.date) return false;

    if (filterType === 'today') {
      return log.date === todayStr;
    }

    if (filterType === 'last7days') {
      const logDate = new Date(log.date);
      const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }

    if (filterType === 'thisMonth') {
      const logDate = new Date(log.date);
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }

    if (filterType === 'custom' && customStartDate && customEndDate) {
      return log.date >= customStartDate && log.date <= customEndDate;
    }

    return true; // 'all'
  });
}
