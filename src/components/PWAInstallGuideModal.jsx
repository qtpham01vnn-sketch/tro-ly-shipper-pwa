import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  Check, 
  DownloadCloud,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function PWAInstallGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ios'); // 'ios' | 'android'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Smartphone className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Cài App Ra Màn Hình Chính</h3>
              <p className="text-xs text-slate-400">Dùng mượt như ứng dụng gốc, mở nhanh 1 chạm</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch iOS / Android */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('ios')}
              className={`py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>🍎 iPhone / iPad (Safari)</span>
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'android'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>🤖 Android (Chrome)</span>
            </button>
          </div>
        </div>

        {/* Nội dung hướng dẫn từng bước */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-300">
          {activeTab === 'ios' ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Mở bằng trình duyệt Safari</p>
                  <p className="text-slate-400 text-[11px]">Đảm bảo bạn đang mở liên kết trang này trên Safari của iPhone.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5 flex items-center gap-1">
                    Bấm nút <Share className="w-3.5 h-3.5 text-sky-400" /> "Chia sẻ" ở đáy màn hình
                  </p>
                  <p className="text-slate-400 text-[11px]">Biểu tượng hình vuông có mũi tên trỏ lên ở thanh công cụ dưới cùng Safari.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5 flex items-center gap-1">
                    Chọn <PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> "Thêm vào MH chính"
                  </p>
                  <p className="text-slate-400 text-[11px]">Cuộn xuống danh sách menu và chọn <em>Add to Home Screen</em> (Thêm vào MH chính).</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Bấm "Thêm" (Add)</p>
                  <p className="text-slate-400 text-[11px]">Biểu tượng App Shipper sẽ xuất hiện ngay trên màn hình chính như ứng dụng thông thường!</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5">Mở bằng Google Chrome</p>
                  <p className="text-slate-400 text-[11px]">Mở đường link ứng dụng trên trình duyệt Chrome trên điện thoại Android.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5 flex items-center gap-1">
                    Bấm dấu 3 chấm <MoreVertical className="w-3.5 h-3.5 text-emerald-400" /> góc trên cùng
                  </p>
                  <p className="text-slate-400 text-[11px]">Bấm vào nút menu 3 chấm ở góc trên bên phải màn hình Chrome.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5 flex items-center gap-1">
                    Chọn <DownloadCloud className="w-3.5 h-3.5 text-sky-400" /> "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính"
                  </p>
                  <p className="text-slate-400 text-[11px]">Chọn <em>Install app</em> hoặc <em>Add to Home screen</em>.</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center gap-2 text-sky-300 font-medium text-[11px]">
            <Check className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Ứng dụng chạy offline không tốn dung lượng 4G và tự động lưu mọi dữ liệu.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-98 transition"
          >
            Đã Hiểu, Bắt Đầu Sử Dụng
          </button>
        </div>
      </div>
    </div>
  );
}
