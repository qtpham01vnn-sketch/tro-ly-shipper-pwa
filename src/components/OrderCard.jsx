import React, { useState } from 'react';
import { 
  Phone, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertTriangle,
  Edit2,
  Trash2,
  QrCode,
  Banknote,
  Smartphone
} from 'lucide-react';
import { formatVND } from '../services/exportService';

export default function OrderCard({
  order,
  onMarkDelivered,
  onOpenFailModal,
  onOpenVietQR,
  onUndoStatus,
  onEditOrder,
  onDeleteOrder
}) {
  const [copied, setCopied] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isUrgent = Boolean(
    order.deliveryNote && 
    (
      order.deliveryNote.toLowerCase().includes('gấp') ||
      order.deliveryNote.toLowerCase().includes('hẹn') ||
      order.deliveryNote.toLowerCase().includes('trước') ||
      order.deliveryNote.toLowerCase().includes('sau') ||
      order.deliveryNote.toLowerCase().includes('giờ')
    )
  );

  const isDelivered = order.status === 'delivered';
  const isFailed = order.status === 'failed';
  const hasCOD = Number(order.codAmount) > 0;
  const paymentMethod = order.paymentMethod || 'cash'; // 'cash' | 'transfer'

  // URL dẫn đường Google Maps
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.fullAddress)}`;

  const handleDeliveredClick = () => {
    if (hasCOD) {
      setShowPaymentChoice(true);
    } else {
      onMarkDelivered(order.id, 'free');
    }
  };

  return (
    <div className={`relative rounded-2xl border transition-all duration-200 overflow-hidden shadow-md ${
      isDelivered 
        ? 'bg-slate-900/60 border-emerald-500/30 opacity-80' 
        : isFailed
        ? 'bg-slate-900/80 border-rose-500/40'
        : isUrgent
        ? 'bg-slate-900 border-amber-500/50 shadow-amber-500/10'
        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Thanh trạng thái đỉnh thẻ */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hãng vận chuyển & Mã đơn */}
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700">
            {order.carrier || 'Đơn'}
          </span>
          <button
            onClick={() => handleCopy(order.trackingCode)}
            className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60"
            title="Bấm để sao chép mã"
          >
            <span>{order.trackingCode}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>

        {/* Tiền COD thu hộ + Nút mở QR thanh toán */}
        <div className="flex items-center gap-1.5">
          {hasCOD ? (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                COD: {formatVND(order.codAmount)}
              </span>
              {onOpenVietQR && !isDelivered && (
                <button
                  onClick={() => onOpenVietQR(order)}
                  className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition active:scale-95"
                  title="Mở mã VietQR chuyển khoản"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                </button>
              )}
            </>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
              0đ (Đã thanh toán)
            </span>
          )}
        </div>
      </div>

      {/* Nội dung thông tin người nhận & Địa chỉ */}
      <div className="p-3.5 space-y-2">
        {/* Tên khách & SĐT */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white">
              {order.customerName || 'Khách hàng'}
            </span>
            <a 
              href={`tel:${order.phone}`}
              className="font-mono font-bold text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded hover:bg-sky-500/20 underline decoration-sky-500/40"
            >
              {order.phone}
            </a>
          </div>

          {/* Action edit/delete nhỏ */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditOrder(order)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
              title="Sửa thông tin"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteOrder(order.id)}
              className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
              title="Xóa đơn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Địa chỉ giao hàng to rõ */}
        <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-slate-200 leading-snug">
            {order.fullAddress}
          </p>
        </div>

        {/* Ghi chú hẹn giờ / Gấp (nếu có) */}
        {order.deliveryNote && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
            isUrgent 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 urgent-glow' 
              : 'bg-slate-800/60 text-slate-300 border border-slate-700'
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Ghi chú: {order.deliveryNote}</span>
          </div>
        )}

        {/* Lý do thất bại nếu có */}
        {isFailed && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span>{order.failReason || 'Giao không thành công'}</span>
              {order.callAttempts > 0 && (
                <span className="ml-1 text-[11px] text-rose-400 font-bold block">
                  (Đã liên hệ {order.callAttempts} cuộc)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KHU VỰC NÚT THAO TÁC 1-CHẠM NGOÀI ĐƯỜNG (Field Delivery Quick Action Buttons) */}
      <div className="p-3 pt-0">
        {isDelivered ? (
          <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Giao thành công • {hasCOD ? (paymentMethod === 'transfer' ? '📲 Khách Chuyển khoản' : '💵 Thu Tiền mặt') : '0đ'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasCOD && (
                <button
                  onClick={() => onMarkDelivered(order.id, paymentMethod === 'transfer' ? 'cash' : 'transfer')}
                  className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded font-bold transition"
                  title="Bấm để đổi hình thức thanh toán"
                >
                  {paymentMethod === 'transfer' ? 'Đổi sang Tiền Mặt' : 'Đổi sang CK'}
                </button>
              )}
              <button
                onClick={() => onUndoStatus(order.id)}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Hoàn tác</span>
              </button>
            </div>
          </div>
        ) : showPaymentChoice ? (
          /* Popup chọn nhanh phương thức khi bấm Đã Giao */
          <div className="p-2 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-2 animate-fade-in">
            <div className="text-center text-[11px] font-bold text-slate-300">
              Khách thanh toán COD <strong className="text-emerald-400">{formatVND(order.codAmount)}</strong> bằng hình thức nào?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentChoice(false);
                  onMarkDelivered(order.id, 'cash');
                }}
                className="py-2 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Banknote className="w-4 h-4" />
                <span>💵 Thu Tiền Mặt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPaymentChoice(false);
                  onMarkDelivered(order.id, 'transfer');
                }}
                className="py-2 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>📲 Chuyển Khoản</span>
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPaymentChoice(false)}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline font-medium"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {/* 1. NÚT GỌI ĐIỆN TO BẢN */}
            <a
              href={`tel:${order.phone}`}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-extrabold text-[11px] active:scale-95 transition shadow-sm"
              title="Gọi điện trực tiếp"
            >
              <Phone className="w-5 h-5 text-emerald-400 mb-0.5" />
              <span>Gọi điện</span>
            </a>

            {/* 2. NÚT DẪN ĐƯỜNG GOOGLE MAPS */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-extrabold text-[11px] active:scale-95 transition shadow-sm"
              title="Mở Google Maps dẫn đường"
            >
              <Navigation className="w-5 h-5 text-sky-400 mb-0.5" />
              <span>Chỉ đường</span>
            </a>

            {/* 3. NÚT BÁO CHƯA GIAO (Mở modal chọn lý do) */}
            <button
              onClick={() => onOpenFailModal(order)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl font-extrabold text-[11px] active:scale-95 transition shadow-sm ${
                isFailed 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' 
                  : 'bg-slate-800 hover:bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
              title="Ghi nhận lý do chưa giao"
            >
              <XCircle className="w-5 h-5 text-rose-400 mb-0.5" />
              <span>{isFailed ? 'Đổi lý do' : 'Chưa giao'}</span>
            </button>

            {/* 4. NÚT ĐÃ GIAO XONG (Nổi bật nhất - chuyển trạng thái lập tức) */}
            <button
              onClick={handleDeliveredClick}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-[11px] shadow-lg shadow-emerald-500/25 active:scale-95 transition"
              title="Xác nhận giao thành công"
            >
              <CheckCircle2 className="w-5 h-5 text-white mb-0.5" />
              <span>ĐÃ GIAO</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

