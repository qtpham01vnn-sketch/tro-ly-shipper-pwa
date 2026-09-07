import React from 'react';
import { 
  Truck, 
  Camera, 
  FileSpreadsheet, 
  Settings, 
  PlusCircle, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Wallet,
  Smartphone
} from 'lucide-react';
import { formatVND } from '../services/exportService';

export default function Header({
  orders = [],
  shippingWage = 4500,
  shipperName = 'Shipper',
  carrier = 'Giao hàng',
  onOpenScanner,
  onOpenReport,
  onOpenSettings,
  onOpenAddOrder,
  onOpenInstallGuide
}) {
  const totalOrders = orders.length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const failedCount = orders.filter((o) => o.status === 'failed').length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const progressPercent = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;
  
  // Tính tổng tiền công kiếm được
  const totalEarnings = deliveredCount * shippingWage;

  // Tính tổng tiền Tip khách bo thêm
  const totalTip = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.tipAmount) || 0), 0);

  // Tính tổng tiền COD cần nộp (chỉ tính đơn đã giao)
  const totalDeliveredCOD = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);

  // Phân tách Tiền mặt vs Chuyển khoản
  const cashCOD = orders
    .filter((o) => o.status === 'delivered' && (o.paymentMethod === 'cash' || !o.paymentMethod))
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);

  const transferCOD = orders
    .filter((o) => o.status === 'delivered' && o.paymentMethod === 'transfer')
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl select-none pt-[env(safe-area-inset-top,0px)]">
      {/* Thanh định danh & nút chức năng */}
      <div className="max-w-4xl mx-auto px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
            <Truck className="w-5 h-5 text-white animate-bounce-short" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-100 text-base leading-tight tracking-tight">
                Trợ Lý Shipper
              </h1>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {carrier || 'VN Logistics'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Chào, <span className="text-amber-400 font-semibold">{shipperName}</span> • Tuyến hôm nay
            </p>
          </div>
        </div>

        {/* Nút hành động nhanh */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenInstallGuide}
            title="Cài App vào Màn hình chính"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 flex items-center justify-center"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
          </button>
          <button
            onClick={onOpenSettings}
            title="Cài đặt hệ thống & API Key"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 flex items-center justify-center"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-bold text-xs transition active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Bảng đồng hồ số liệu thời gian thực (Real-time Dashboard Metrics) */}
      <div className="max-w-4xl mx-auto px-3.5 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {/* Cột 1: Tiến độ giao */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Đã giao
              </span>
              <span className="font-bold text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white tracking-tight leading-none">
                {deliveredCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                /{totalOrders}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cột 2: Tiền công & Tiền Tip */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-amber-300">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Thu nhập {totalTip > 0 ? '(+Tip)' : 'hôm nay'}</span>
              </span>
            </div>
            <div className="text-lg font-black text-amber-400 tracking-tight leading-none truncate">
              {formatVND(totalEarnings + totalTip)}
            </div>
            <div className="text-[9.5px] text-slate-400 mt-1 font-medium truncate flex items-center justify-between">
              <span>Công: {formatVND(totalEarnings)}</span>
              {totalTip > 0 && <span className="text-amber-300 font-bold">🎁 +{formatVND(totalTip)}</span>}
            </div>
          </div>

          {/* Cột 3: Tiền COD cần nộp kho */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-sky-300">
                <Wallet className="w-3.5 h-3.5 text-sky-400" />
                COD nộp kho
              </span>
            </div>
            <div className="text-lg font-black text-sky-400 tracking-tight leading-none truncate">
              {formatVND(totalDeliveredCOD)}
            </div>
            <div className="text-[9.5px] text-slate-400 mt-1 font-medium flex items-center justify-between gap-1 truncate">
              <span title="Tiền mặt">💵 {formatVND(cashCOD)}</span>
              <span title="Chuyển khoản">📲 {formatVND(transferCOD)}</span>
            </div>
          </div>
        </div>

        {/* Action Bar nhanh phía dưới: Nút Quét OCR to bản */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={onOpenScanner}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-98 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Quét Đơn Hàng Loạt (OCR)</span>
          </button>
          
          <button
            onClick={onOpenAddOrder}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-98 transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Thêm 1 Đơn Thủ Công</span>
          </button>
        </div>
      </div>
    </header>
  );
}
