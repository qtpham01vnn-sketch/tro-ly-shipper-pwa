import React, { useState } from 'react';
import { 
  X, 
  Key, 
  DollarSign, 
  User, 
  Truck, 
  Save, 
  Sparkles, 
  Database, 
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

import { getSupabaseConfig, saveSupabaseConfig } from '../services/supabaseService';

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  orders = [],
  onSaveConfig,
  onImportOrders = () => {},
  onLoadSampleData,
  onClearAllData
}) {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [shippingWage, setShippingWage] = useState(config.shippingWage || 4500);
  const [baseSalary, setBaseSalary] = useState(config.baseSalary || 5000000);
  const [shipperName, setShipperName] = useState(config.shipperName || 'Shipper Pro');
  const [carrier, setCarrier] = useState(config.carrier || 'J&T Express');
  const [selectedModel, setSelectedModel] = useState(config.selectedModel || 'gemini-1.5-flash');

  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseConfig().supabaseAnonKey || '');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({
      apiKey: apiKey.trim(),
      shippingWage: Number(shippingWage) || 4500,
      baseSalary: Number(baseSalary) || 5000000,
      shipperName: shipperName.trim() || 'Shipper Pro',
      carrier: carrier.trim() || 'Giao Hàng',
      selectedModel: selectedModel || 'gemini-1.5-flash'
    });
    saveSupabaseConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim()
    });
    onClose();
  };

  const carrierOptions = [
    'Shopee Express (SPX)',
    'Giao Hàng Nhanh (GHN)',
    'Giao Hàng Tiết Kiệm (GHTK)',
    'Viettel Post',
    'J&T Express',
    'TikTok Shop',
    'Ninja Van',
    'VNPost'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Cấu Hình & Cài Đặt Hệ Thống</h3>
              <p className="text-xs text-slate-400">Tùy biến bảng giá, thông tin shipper và Gemini API</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung form cài đặt */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Cấu hình Gemini API Key */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-sky-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-sky-400" />
                <span>Google Gemini API Key</span>
              </label>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-0.5 font-bold"
              >
                <span>Lấy key miễn phí</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Dán AIzaSy... vào đây để quét ảnh thật"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Key lưu an toàn trong trình duyệt (localStorage), không gửi đi máy chủ nào khác.</span>
            </div>
          </div>

          {/* Model AI */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Mô hình AI nhận diện (Vision Model):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-1.5-flash')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                  selectedModel === 'gemini-1.5-flash'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-extrabold">Gemini 1.5 Flash</div>
                <div className="text-[10px] text-slate-400 font-normal">Tối ưu tốc độ cao & ổn định</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel('gemini-2.5-flash')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                  selectedModel === 'gemini-2.5-flash'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-extrabold">Gemini 2.5 Flash</div>
                <div className="text-[10px] text-slate-400 font-normal">Đọc ảnh chữ viết tay tốt hơn</div>
              </button>
            </div>
          </div>

          {/* Lương cứng cố định */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Lương cứng cố định hàng tháng (VNĐ)</span>
            </label>
            <input
              type="number"
              step="500000"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              {[4000000, 5000000, 6000000, 7000000, 8000000].map((sal) => (
                <button
                  key={sal}
                  type="button"
                  onClick={() => setBaseSalary(sal)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${
                    Number(baseSalary) === sal
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {(sal / 1000000)}tr
                </button>
              ))}
            </div>
          </div>

          {/* Đơn giá tiền công / đơn */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Tiền công shipper / mỗi đơn giao thành công (VNĐ)</span>
            </label>
            <input
              type="number"
              step="500"
              value={shippingWage}
              onChange={(e) => setShippingWage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-amber-400 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              {[3500, 4000, 4500, 5000, 6000].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setShippingWage(fee)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${
                    Number(shippingWage) === fee
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {fee.toLocaleString('vi-VN')}đ
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin Shipper & Hãng giao hàng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Tên Shipper:
              </label>
              <input
                type="text"
                value={shipperName}
                onChange={(e) => setShipperName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Bưu cục / Hãng VC:
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
              >
                {carrierOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cấu hình Supabase Cloud Database */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase Cloud Database (Tự đồng bộ đa thiết bị)</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              Nhập URL & Anon Key dự án Supabase để dữ liệu quét trên máy tính tự động nhảy sang điện thoại / Vercel ngay lập tức.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="Supabase Project URL (https://xxxx.supabase.co)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="Supabase Anon Key (eyJhbGciOi...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quản lý sao lưu dữ liệu */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400">Sao lưu & Đồng bộ Thủ Công:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                    orders: orders || [],
                    config: { apiKey, shippingWage, baseSalary, shipperName, carrier, selectedModel },
                    exportedAt: new Date().toISOString()
                  }, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `shipper_backup_${new Date().toISOString().slice(0, 10)}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>📥 Xuất Sao Lưu JSON</span>
              </button>

              <label className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
                <span>📤 Nhập Sao Lưu</span>
                <input 
                  type="file" 
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target.result);
                        if (parsed.orders && Array.isArray(parsed.orders)) {
                          onImportOrders(parsed.orders);
                          if (parsed.config) {
                            onSaveConfig(parsed.config);
                          }
                          alert(`Khôi phục thành công ${parsed.orders.length} đơn hàng!`);
                          onClose();
                        } else {
                          alert('File sao lưu không đúng định dạng.');
                        }
                      } catch (err) {
                        alert('Lỗi đọc file sao lưu: ' + err.message);
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Nút thử nghiệm nhanh */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400">Dữ liệu thử nghiệm:</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onLoadSampleData();
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Database className="w-4 h-4" />
                <span>Nạp 8 Đơn Mẫu Thực Tế</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa sạch toàn bộ dữ liệu đơn hàng hiện tại?')) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition"
                title="Xóa trắng dữ liệu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cài Đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
