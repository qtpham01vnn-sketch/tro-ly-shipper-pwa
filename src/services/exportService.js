/**
 * Dịch vụ Xuất Báo Cáo Zalo và File Excel/CSV Đối Soát
 */

// Định dạng tiền tệ VNĐ
export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

/**
 * Tạo nội dung tin nhắn báo cáo Zalo chuẩn cho Thủ Kho / Quản lý tuyến
 */
export function generateZaloReport({
  shipperName = 'Shipper',
  carrier = 'Giao hàng',
  orders = [],
  shippingWage = 4500,
  date = new Date()
}) {
  const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const failedOrders = orders.filter((o) => o.status === 'failed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const deliveredCount = deliveredOrders.length;
  const failedCount = failedOrders.length;
  const pendingCount = pendingOrders.length;
  const successRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

  // Tính tiền COD thu hộ của các đơn giao thành công
  const totalDeliveredCOD = deliveredOrders.reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);
  const cashCOD = deliveredOrders
    .filter((o) => o.paymentMethod === 'cash' || !o.paymentMethod)
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);
  const transferCOD = deliveredOrders
    .filter((o) => o.paymentMethod === 'transfer')
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);

  // Tính tổng công nhật kiếm được
  const totalShipperEarnings = deliveredCount * shippingWage;

  let report = `📦 BÁO CÁO KẾT CA GIAO HÀNG - ${dateStr}\n`;
  report += `👤 Shipper: ${shipperName} | ${carrier}\n`;
  report += `⏰ Thời gian chốt ca: ${timeStr}\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `📊 TỔNG HỢP VẬN ĐƠN:\n`;
  report += `• Tổng nhận: ${totalOrders} đơn\n`;
  report += `• ✅ Đã giao thành công: ${deliveredCount} đơn (${successRate}%)\n`;
  report += `• ❌ Giao không thành công/Hoàn: ${failedCount} đơn\n`;
  if (pendingCount > 0) {
    report += `• ⏳ Đang chờ giao tiếp: ${pendingCount} đơn\n`;
  }
  report += `━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `💰 ĐỐI SOÁT TÀI CHÍNH & KÉT TIỀN:\n`;
  report += `• 💵 Tiền mặt thu thực tế nộp kho: ${formatVND(cashCOD)}\n`;
  report += `• 📲 Khách chuyển khoản TK: ${formatVND(transferCOD)}\n`;
  report += `• 📦 Tổng COD toàn bộ ca: ${formatVND(totalDeliveredCOD)}\n`;
  report += `• 🛵 Tiền công nhật tạm tính: ${formatVND(totalShipperEarnings)} (${deliveredCount} đơn x ${formatVND(shippingWage)})\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (failedCount > 0) {
    report += `🚨 CHI TIẾT ${failedCount} ĐƠN TỒN / CHƯA GIAO ĐƯỢC:\n`;
    failedOrders.forEach((item, index) => {
      report += `\n${index + 1}. [${item.trackingCode}] - ${item.customerName} (${item.phone})\n`;
      report += `   📍 Đ/C: ${item.fullAddress}\n`;
      report += `   ⚠️ Lý do: ${item.failReason || 'Khách chưa nhận'}\n`;
      if (item.callAttempts > 0) {
        report += `   📞 Đã gọi: ${item.callAttempts} cuộc\n`;
      }
    });
    report += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  }

  report += `Cam kết đã đối chiếu đủ tiền mặt và hàng tồn về kho an toàn! 🤝`;
  return report;
}

/**
 * Tải xuống file CSV chuẩn UTF-8 (mở trực tiếp trên Excel không bị lỗi font tiếng Việt)
 */
export function exportOrdersToCSV(orders = [], filename = 'Doi_Soat_Giao_Hang.csv') {
  if (!orders || orders.length === 0) {
    alert('Không có dữ liệu đơn hàng để xuất file');
    return;
  }

  const headers = [
    'STT',
    'Mã vận đơn',
    'Khách hàng',
    'Số điện thoại',
    'Địa chỉ giao',
    'Tuyến / Cụm đường',
    'Tiền COD (VNĐ)',
    'Hình thức thanh toán',
    'Tiền công (VNĐ)',
    'Trạng thái',
    'Lý do thất bại',
    'Ghi chú hẹn giờ',
    'Đơn vị VC'
  ];

  const rows = orders.map((item, index) => {
    let statusText = 'Chờ giao';
    if (item.status === 'delivered') statusText = 'Đã giao thành công';
    if (item.status === 'failed') statusText = 'Chưa giao được / Tồn';

    let payText = 'Chưa thu';
    if (item.status === 'delivered') {
      payText = item.paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt';
    }

    return [
      index + 1,
      `"${item.trackingCode || ''}"`,
      `"${(item.customerName || '').replace(/"/g, '""')}"`,
      `"${item.phone || ''}"`,
      `"${(item.fullAddress || '').replace(/"/g, '""')}"`,
      `"${(item.streetOrArea || '').replace(/"/g, '""')}"`,
      item.codAmount || 0,
      `"${payText}"`,
      item.shippingFee || 4500,
      `"${statusText}"`,
      `"${(item.failReason || '').replace(/"/g, '""')}"`,
      `"${(item.deliveryNote || '').replace(/"/g, '""')}"`,
      `"${item.carrier || ''}"`
    ].join(',');
  });

  // UTF-8 BOM \uFEFF giúp Microsoft Excel nhận diện đúng tiếng Việt có dấu
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
