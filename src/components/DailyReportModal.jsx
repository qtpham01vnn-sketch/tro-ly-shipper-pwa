import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet, 
  DollarSign, 
  AlertTriangle,
  RotateCcw,
  Share2
} from 'lucide-react';
import { 
  formatVND, 
  generateZaloReport, 
  exportOrdersToCSV 
} from '../services/exportService';

export default function DailyReportModal({
  isOpen,
  onClose,
  orders = [],
  shippingWage = 4500,
  shipperName = 'Shipper',
  carrier = 'Giao hàng',
  onResetDay
}) {
  const [copied, setCopied] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const failedOrders = orders.filter((o) => o.status === 'failed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const deliveredCount = deliveredOrders.length;
  const failedCount = failedOrders.length;
  const pendingCount = pendingOrders.length;
  const successRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

  // Tính tiền COD các đơn đã giao
  const totalDeliveredCOD = deliveredOrders.reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);
  const cashCOD = deliveredOrders
    .filter((o) => o.paymentMethod === 'cash' || !o.paymentMethod)
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);
  const transferCOD = deliveredOrders
    .filter((o) => o.paymentMethod === 'transfer')
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);

  const totalShipperEarnings = deliveredCount * shippingWage;

  const reportText = generateZaloReport({
    shipperName,
    carrier,
    orders,
    shippingWage
  });

  const handleCopyZalo = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    exportOrdersToCSV(orders, `DoiSoat_${shipperName}_${today}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Báo Cáo Cuối Ca & Đối Soát COD</h3>
              <p className="text-xs text-slate-400">
                {shipperName} • {carrier} • {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung báo cáo */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Card Thống kê Tài chính nổi bật */}
          <div className="grid grid-cols-2 gap-3">
            {/* Box 1: Tiền COD nộp kho */}
            <div className="p-3.5 bg-gradient-to-br from-sky-950/60 to-slate-950 border border-sky-500/30 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold mb-1">
                <Wallet className="w-4 h-4" />
                <span>Tổng COD Nộp Bưu Cục</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {formatVND(totalDeliveredCOD)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Từ {deliveredCount} đơn giao thành công
              </div>
            </div>

            {/* Box 2: Tiền công kiếm được */}
            <div className="p-3.5 bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-500/30 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Tiền Công Thực Nhận</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                {formatVND(totalShipperEarnings)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {deliveredCount} đơn x {formatVND(shippingWage)}/đơn
              </div>
            </div>
          </div>

          {/* Bảng phân tách Tiền Mặt vs Chuyển Khoản & Đối soát két */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Wallet className="w-4 h-4" />
                <span>Két Tiền & Đối Soát Nộp Thủ Quỹ Bưu Cục:</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">💵 Tiền Mặt thu thực tế:</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {formatVND(cashCOD)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Móc túi nộp thủ quỹ bưu cục
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">📲 Khách Chuyển Khoản:</div>
                <div className="text-base font-black text-sky-400 font-mono">
                  {formatVND(transferCOD)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Đã vào tài khoản cá nhân
                </div>
              </div>
            </div>
          </div>

          {/* KPI Tỷ lệ giao hàng */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Hiệu suất giao hôm nay</span>
              <span className="text-emerald-400 font-black">{successRate}% Thành công</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-emerald-400 font-extrabold text-base">{deliveredCount}</div>
                <div className="text-[10px] text-slate-400">Đã giao</div>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-rose-400 font-extrabold text-base">{failedCount}</div>
                <div className="text-[10px] text-slate-400">Chưa giao / Tồn</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                <div className="text-slate-300 font-extrabold text-base">{pendingCount}</div>
                <div className="text-[10px] text-slate-400">Đang chờ</div>
              </div>
            </div>
          </div>

          {/* Danh sách các đơn chưa giao (Giải trình thủ kho) */}
          {failedCount > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h4 className="font-extrabold text-xs text-rose-300 uppercase tracking-wide">
                  Chi tiết {failedCount} đơn hoàn / tồn về kho:
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {failedOrders.map((order, idx) => (
                  <div 
                    key={order.id || idx}
                    className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-sky-400 font-mono">{order.trackingCode}</span>
                      <span className="text-white">{order.customerName} - {order.phone}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate">
                      📍 {order.fullAddress}
                    </div>
                    <div className="text-rose-400 font-semibold text-[11px]">
                      ⚠️ Lý do: {order.failReason || 'Khách chưa nhận'}
                      {order.callAttempts > 0 && ` (${order.callAttempts} cuộc gọi)`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-bold text-emerald-400">
              🎉 Tuyệt vời! Không có đơn nào bị tồn hay giao thất bại hôm nay!
            </div>
          )}

          {/* Khung xem trước văn bản báo cáo Zalo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400">
                Mẫu tin nhắn dán Zalo gửi Thủ kho:
              </label>
              <button
                onClick={handleCopyZalo}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép nhanh'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto select-all leading-relaxed">
              {reportText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {/* Nút Sao chép Zalo */}
            <button
              onClick={handleCopyZalo}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'ĐÃ COPY BÁO CÁO' : 'COPY DÁN VÀO ZALO'}</span>
            </button>

            {/* Nút Tải CSV/Excel */}
            <button
              onClick={handleExportCSV}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>TẢI FILE EXCEL / CSV</span>
            </button>
          </div>

          {/* Reset ngày mới */}
          <div className="flex items-center justify-between pt-1">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chốt ca & Xóa dữ liệu ca cũ</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-500/10 p-2 rounded-xl border border-rose-500/30 w-full justify-between">
                <span className="text-[11px] text-rose-300 font-bold">Xác nhận xóa hết đơn ca này?</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onResetDay();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
