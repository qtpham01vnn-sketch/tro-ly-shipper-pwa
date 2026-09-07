import React from 'react';
import { 
  Truck, 
  Camera, 
  FileSpreadsheet, 
  Calendar, 
  FileText, 
  Settings, 
  PlusCircle, 
  Smartphone,
  Wallet,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { formatVND } from '../services/exportService';

export default function Sidebar({
  activeView, // 'delivery' | 'logbook'
  onChangeView,
  onOpenScanner,
  onOpenReport,
  onOpenTCVNReport,
  onOpenSettings,
  onOpenAddOrder,
  onOpenInstallGuide,
  orders = [],
  shippingWage = 4500,
  baseSalary = 5000000,
  shipperName = 'Shipper Pro',
  carrier = 'J&T Express'
}) {
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalWageEarned = deliveredCount * shippingWage;

  return (
    <>
      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI TRÊN MÀN HÌNH MÁY TÍNH / TABLET (DESKTOP) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 h-screen sticky top-0 select-none z-40">
        {/* Logo App */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-white text-sm tracking-tight leading-none">
              Trợ Lý Shipper
            </h1>
            <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 mt-1 inline-block">
              {carrier}
            </span>
          </div>
        </div>

        {/* Thông tin Shipper & Lương cứng */}
        <div className="p-3.5 m-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Shipper:</span>
            <span className="text-xs font-black text-amber-400 truncate">{shipperName}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Lương cứng:</span>
            <span className="font-bold text-white">{formatVND(baseSalary)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
            <span className="text-slate-400">Công ca nay:</span>
            <span className="font-bold text-emerald-400">+{formatVND(totalWageEarned)}</span>
          </div>
        </div>

        {/* Danh sách các Menu / Tags điều hướng */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {/* Tab 1: Tuyến giao hàng hôm nay */}
          <button
            onClick={() => onChangeView('delivery')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              activeView === 'delivery'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 font-extrabold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Tuyến Giao Hôm Nay</span>
            {orders.length > 0 && (
              <span className="ml-auto text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          {/* Action 2: Quét đơn hàng loạt AI */}
          <button
            onClick={onOpenScanner}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-sky-400 hover:bg-sky-500/10 transition text-left"
          >
            <Camera className="w-4 h-4" />
            <span>Quét Đơn AI (OCR)</span>
          </button>

          {/* Action 3: Báo cáo ca Zalo/Excel */}
          <button
            onClick={onOpenReport}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition text-left"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Báo Cáo Cuối Ca</span>
          </button>

          {/* Tab 4: Sổ nhật ký & Lương các ngày */}
          <button
            onClick={() => onChangeView('logbook')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
              activeView === 'logbook'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 font-extrabold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Sổ Nhật Ký & Lương Ngày</span>
          </button>

          {/* Action 5: Biên bản In / PDF TCVN */}
          <button
            onClick={() => onOpenTCVNReport(orders, shippingWage, baseSalary, shipperName, carrier)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition text-left"
          >
            <FileText className="w-4 h-4" />
            <span>In Biên Bản (Chuẩn TCVN)</span>
          </button>

          {/* Action 6: Thêm đơn thủ công */}
          <button
            onClick={onOpenAddOrder}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition text-left"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Thêm 1 Đơn Thủ Công</span>
          </button>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            onClick={onOpenInstallGuide}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Cài App Ra Màn Hình</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt & API Key</span>
          </button>
        </div>
      </aside>

      {/* 2. THANH ĐIỀU HƯỚNG DƯỚI ĐÁY CHO MOBILE (BOTTOM NAV) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => onChangeView('delivery')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition ${
            activeView === 'delivery' ? 'text-sky-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span>Tuyến Giao</span>
        </button>

        <button
          onClick={onOpenScanner}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold text-sky-400"
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span>Quét AI</span>
        </button>

        <button
          onClick={() => onChangeView('logbook')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition ${
            activeView === 'logbook' ? 'text-sky-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Sổ Lương</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold text-amber-400"
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          <span>Báo Cáo</span>
        </button>

        <button
          onClick={() => onOpenTCVNReport(orders, shippingWage, baseSalary, shipperName, carrier)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold text-emerald-400"
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>In A4/PDF</span>
        </button>
      </div>
    </>
  );
}
