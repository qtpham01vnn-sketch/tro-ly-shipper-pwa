import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Wallet, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Printer, 
  FileSpreadsheet, 
  Filter, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  Search,
  Plus
} from 'lucide-react';
import { formatVND } from '../services/exportService';
import { getDailyLogs, filterLogs } from '../services/historyService';

export default function DailyLogbookView({
  baseSalary = 5000000,
  shippingWage = 4500,
  shipperName = 'Shipper Pro',
  carrier = 'J&T Express',
  currentDayOrders = [],
  onOpenTCVNReport
}) {
  const [logs, setLogs] = useState(() => getDailyLogs());
  const [filterType, setFilterType] = useState('all'); // 'all' | 'today' | 'last7days' | 'thisMonth' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Lọc danh sách nhật ký
  const filteredLogs = useMemo(() => {
    return filterLogs(logs, filterType, customStartDate, customEndDate);
  }, [logs, filterType, customStartDate, customEndDate]);

  // Tổng hợp số liệu lũy kế của các ngày đã lọc
  const summary = useMemo(() => {
    let totalOrders = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalCOD = 0;
    let totalWageEarned = 0;

    filteredLogs.forEach((l) => {
      totalOrders += l.totalOrders || 0;
      totalDelivered += l.deliveredCount || 0;
      totalFailed += l.failedCount || 0;
      totalCOD += l.totalCOD || 0;
      totalWageEarned += l.totalWageEarned || 0;
    });

    const totalIncome = baseSalary + totalWageEarned;

    return {
      totalOrders,
      totalDelivered,
      totalFailed,
      totalCOD,
      totalWageEarned,
      totalIncome
    };
  }, [filteredLogs, baseSalary]);

  const toggleExpand = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. KHUNG TỔNG QUAN TÀI CHÍNH & THU NHẬP LŨY KẾ */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950/40 rounded-3xl border border-slate-800 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Sổ Nhật Ký & Quyết Toán Thu Nhập</h2>
              <p className="text-[11px] text-slate-400">Theo dõi doanh thu, đối soát COD và tiền lương tích lũy</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 text-[10px] font-bold border border-slate-700">
            Lương cứng: {formatVND(baseSalary)}
          </span>
        </div>

        {/* 4 Thẻ chỉ số tổng */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Thẻ 1: Tổng thu nhập thực tế */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>TỔNG THU NHẬP</span>
            </div>
            <div className="text-lg font-black text-emerald-400 truncate">
              {formatVND(summary.totalIncome)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Lương {formatVND(baseSalary)} + Công
            </div>
          </div>

          {/* Thẻ 2: Tiền công phát hàng */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>TIỀN CÔNG ĐƠN</span>
            </div>
            <div className="text-lg font-black text-amber-400 truncate">
              {formatVND(summary.totalWageEarned)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              +{formatVND(shippingWage)}/đơn thành công
            </div>
          </div>

          {/* Thẻ 3: Tổng COD đã nộp */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-sky-500/30">
            <div className="flex items-center gap-1 text-[11px] text-sky-400 font-bold mb-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>COD ĐÃ NỘP KHO</span>
            </div>
            <div className="text-lg font-black text-sky-400 truncate">
              {formatVND(summary.totalCOD)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {summary.totalDelivered} đơn phát thành công
            </div>
          </div>

          {/* Thẻ 4: Tổng đơn & Tỷ lệ */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1 text-[11px] text-slate-300 font-bold mb-1">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>SẢN LƯỢNG ĐƠN</span>
            </div>
            <div className="text-lg font-black text-white truncate">
              {summary.totalDelivered} / {summary.totalOrders}
            </div>
            <div className="text-[10px] text-rose-400 mt-0.5">
              Hoàn/Tồn: {summary.totalFailed} đơn
            </div>
          </div>
        </div>
      </div>

      {/* 2. BỘ LỌC THỜI GIAN THÔNG MINH */}
      <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Lọc nhật ký theo thời gian:</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Hiển thị: <strong>{filteredLogs.length}</strong> ngày
          </span>
        </div>

        {/* Các nút preset nhanh */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'today', label: 'Hôm nay' },
            { key: 'last7days', label: '7 ngày qua' },
            { key: 'thisMonth', label: 'Tháng này' },
            { key: 'custom', label: 'Chọn khoảng ngày' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterType === tab.key
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-extrabold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Khung chọn ngày tùy chỉnh nếu chọn 'custom' */}
        {filterType === 'custom' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Từ ngày:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Đến ngày:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. DANH SÁCH NHẬT KÝ THEO TỪNG NGÀY */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-300">Chưa có dữ liệu nhật ký cho khoảng thời gian này</h4>
            <p className="text-xs text-slate-500 mt-1">
              Khi anh chốt ca hàng ngày, hệ thống sẽ tự động lưu vào sổ này để theo dõi.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const logDateFormatted = new Date(log.date).toLocaleDateString('vi-VN', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            return (
              <div 
                key={log.id || log.date}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition"
              >
                {/* Header Ngày */}
                <div 
                  onClick={() => toggleExpand(log.id)}
                  className="p-3.5 bg-slate-950/60 flex items-center justify-between cursor-pointer select-none hover:bg-slate-950/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center justify-center text-sky-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white capitalize">{logDateFormatted}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                          {log.deliveredCount}/{log.totalOrders} đơn
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-bold">+{formatVND(log.totalWageEarned)} công</span>
                        <span>•</span>
                        <span className="text-sky-400">COD: {formatVND(log.totalCOD)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTCVNReport(log.orders || [], log.shippingWage, baseSalary, log.shipperName, log.carrier, log.date);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
                      title="Xem và In Biên bản TCVN ngày này"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Biên bản TCVN</span>
                    </button>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Chi tiết đơn hàng của ngày khi bấm mở rộng */}
                {isExpanded && (
                  <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-bold pb-1 border-b border-slate-800">
                      <span>Chi tiết các đơn trong ca:</span>
                      <span>{log.orders?.length || 0} đơn</span>
                    </div>

                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {log.orders && log.orders.map((item, idx) => (
                        <div 
                          key={item.id || idx}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-sky-400">{item.trackingCode}</span>
                              <span className="text-white font-semibold">{item.customerName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                              {item.fullAddress}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {item.status === 'delivered' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                                Đã giao • COD: {formatVND(item.codAmount)}
                              </span>
                            ) : item.status === 'failed' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                                Hoàn/Tồn: {item.failReason || 'Chưa giao'}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                                Đang chờ
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
