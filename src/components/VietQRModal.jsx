import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { formatVND } from '../services/exportService';

export const VIETNAM_BANKS = [
  { id: 'MB', name: 'MB Bank (Quân Đội)', shortName: 'MBBank' },
  { id: 'VCB', name: 'Vietcombank', shortName: 'Vietcombank' },
  { id: 'TCB', name: 'Techcombank', shortName: 'Techcombank' },
  { id: 'ACB', name: 'ACB (Á Châu)', shortName: 'ACB' },
  { id: 'VPB', name: 'VPBank', shortName: 'VPBank' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)', shortName: 'TPBank' },
  { id: 'CTG', name: 'VietinBank', shortName: 'VietinBank' },
  { id: 'BIDV', name: 'BIDV', shortName: 'BIDV' },
  { id: 'VBA', name: 'Agribank', shortName: 'Agribank' },
  { id: 'STB', name: 'Sacombank', shortName: 'Sacombank' },
  { id: 'VIB', name: 'VIB', shortName: 'VIB' },
  { id: 'HDB', name: 'HDBank', shortName: 'HDBank' },
  { id: 'MSB', name: 'MSB', shortName: 'MSB' },
  { id: 'OCB', name: 'OCB', shortName: 'OCB' }
];

export default function VietQRModal({
  isOpen,
  onClose,
  order,
  bankConfig = {},
  onConfirmTransferDelivered
}) {
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTipInput, setCustomTipInput] = useState('');

  if (!isOpen || !order) return null;

  const bankId = bankConfig.bankId || 'MB';
  const accountNo = (bankConfig.accountNo || '').trim();
  const accountName = (bankConfig.accountName || 'SHIPPER PRO').trim();
  const codAmount = Number(order.codAmount) || 0;
  const totalPayAmount = codAmount + tipAmount;
  const trackingCode = order.trackingCode || order.id || '';
  const transferContent = `COD ${trackingCode}`.trim();

  // URL sinh ảnh VietQR chuẩn Napas 247 (tự động cộng thêm tiền Tip nếu khách bo)
  const qrImageUrl = accountNo 
    ? `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalPayAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`
    : null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 1500);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 1500);
    }
  };

  const handleConfirm = () => {
    if (onConfirmTransferDelivered) {
      onConfirmTransferDelivered(order.id, 'transfer', tipAmount);
    }
    onClose();
  };

  const handleSelectTip = (amount) => {
    setTipAmount(amount);
    setCustomTipInput('');
  };

  const handleCustomTipChange = (val) => {
    const num = Number(val.replace(/\D/g, '')) || 0;
    setCustomTipInput(val);
    setTipAmount(num);
  };

  const currentBankObj = VIETNAM_BANKS.find(b => b.id === bankId) || VIETNAM_BANKS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Mã VietQR Thanh Toán Động</h3>
              <p className="text-xs text-slate-400">Đã tự động điền sẵn số tiền & mã đơn</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung QR */}
        <div className="p-4 overflow-y-auto flex flex-col items-center space-y-3.5">
          {/* Số tiền cần thu nổi bật */}
          <div className="text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {tipAmount > 0 ? 'Tổng thanh toán (Gốc + Tip)' : 'Số tiền COD cần thanh toán'}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5 font-mono">
              {formatVND(totalPayAmount)}
            </div>
            {tipAmount > 0 && (
              <div className="text-[11px] font-semibold text-amber-300">
                (COD: {formatVND(codAmount)} + 🎁 Tip: {formatVND(tipAmount)})
              </div>
            )}
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              Khách nhận: <strong className="text-white">{order.customerName || 'Khách hàng'}</strong>
            </div>
          </div>

          {/* Ô Chọn Tiền Khách Bo Thêm Nhanh (1-Touch Tip) */}
          <div className="w-full bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 flex items-center gap-1">
                🎁 <span>Khách có bo (tip) thêm không?</span>
              </span>
              {tipAmount > 0 && (
                <span className="text-amber-400">+{formatVND(tipAmount)}</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 5000, 10000, 20000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectTip(amt)}
                  className={`py-1 px-1.5 rounded-xl text-[11px] font-extrabold transition active:scale-95 border ${
                    tipAmount === amt && !customTipInput
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {amt === 0 ? 'Không' : `+${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Khung ảnh QR Code */}
          {accountNo ? (
            <div className="relative p-2.5 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/30">
              <img 
                src={qrImageUrl} 
                alt="VietQR Chuyển Khoản"
                className="w-52 h-auto object-contain rounded-lg"
              />
              <div className="mt-1 text-center text-[10px] text-slate-600 font-bold">
                Quét bằng bất kỳ App Ngân hàng nào (VietQR / Napas247)
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-950/70 border border-amber-500/40 rounded-2xl text-center space-y-2 max-w-xs">
              <div className="text-amber-400 font-bold text-xs">⚠️ Chưa thiết lập Số Tài Khoản Ngân Hàng</div>
              <p className="text-[11px] text-slate-400">
                Vui lòng vào <strong>Cài Đặt ⚙️</strong> để nhập Số tài khoản & Tên ngân hàng nhận tiền chuyển khoản.
              </p>
            </div>
          )}

          {/* Chi tiết tài khoản để đối soát nhanh */}
          <div className="w-full bg-slate-950/80 rounded-2xl p-3 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ngân hàng:</span>
              <strong className="text-sky-400">{currentBankObj.name}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Số tài khoản:</span>
              <button
                type="button"
                onClick={() => handleCopy(accountNo, 'acc')}
                className="flex items-center gap-1 font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded hover:bg-slate-700"
              >
                <span>{accountNo || 'Chưa có'}</span>
                {copiedAcc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Chủ tài khoản:</span>
              <strong className="text-white uppercase">{accountName}</strong>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Nội dung chuyển:</span>
              <button
                type="button"
                onClick={() => handleCopy(transferContent, 'amt')}
                className="flex items-center gap-1 font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded hover:bg-slate-700"
              >
                <span>{transferContent}</span>
                {copiedAmount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã Nhận {formatVND(totalPayAmount)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
