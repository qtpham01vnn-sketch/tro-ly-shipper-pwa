import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Save, 
  MapPin, 
  Phone, 
  User, 
  Tag, 
  Clock, 
  DollarSign,
  Truck
} from 'lucide-react';
import { extractStreetOrArea } from '../services/geminiService';

export default function AddOrderModal({
  isOpen,
  onClose,
  onSaveOrder,
  editingOrder = null,
  defaultShippingFee = 4500,
  carrier = 'Shopee Express'
}) {
  const [trackingCode, setTrackingCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [streetOrArea, setStreetOrArea] = useState('');
  const [codAmount, setCodAmount] = useState(0);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [orderCarrier, setOrderCarrier] = useState(carrier);

  useEffect(() => {
    if (editingOrder) {
      setTrackingCode(editingOrder.trackingCode || '');
      setCustomerName(editingOrder.customerName || '');
      setPhone(editingOrder.phone || '');
      setFullAddress(editingOrder.fullAddress || '');
      setStreetOrArea(editingOrder.streetOrArea || '');
      setCodAmount(editingOrder.codAmount || 0);
      setDeliveryNote(editingOrder.deliveryNote || '');
      setOrderCarrier(editingOrder.carrier || carrier);
    } else {
      setTrackingCode('VN-' + Math.floor(100000 + Math.random() * 900000));
      setCustomerName('');
      setPhone('');
      setFullAddress('');
      setStreetOrArea('');
      setCodAmount(0);
      setDeliveryNote('');
      setOrderCarrier(carrier);
    }
  }, [editingOrder, isOpen, carrier]);

  if (!isOpen) return null;

  // Tự động phân tích tên đường khi shipper gõ địa chỉ
  const handleAddressChange = (e) => {
    const val = e.target.value;
    setFullAddress(val);
    if (!editingOrder || !streetOrArea) {
      setStreetOrArea(extractStreetOrArea(val));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullAddress.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    const orderData = {
      id: editingOrder?.id || ('ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
      trackingCode: trackingCode.trim() || ('VN-' + Math.floor(100000 + Math.random() * 900000)),
      customerName: customerName.trim() || 'Khách hàng',
      phone: phone.trim() || '0900000000',
      fullAddress: fullAddress.trim(),
      streetOrArea: streetOrArea.trim() || extractStreetOrArea(fullAddress),
      codAmount: Number(codAmount) || 0,
      shippingFee: editingOrder?.shippingFee || defaultShippingFee,
      deliveryNote: deliveryNote.trim(),
      status: editingOrder?.status || 'pending',
      failReason: editingOrder?.failReason || '',
      callAttempts: editingOrder?.callAttempts || 0,
      carrier: orderCarrier || carrier
    };

    onSaveOrder(orderData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {editingOrder ? <Save className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {editingOrder ? 'Sửa Đơn Hàng' : 'Thêm Đơn Hàng Thủ Công'}
              </h3>
              <p className="text-xs text-slate-400">Nhập nhanh thông tin bưu kiện</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Mã vận đơn:
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="SPX-..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Đơn vị VC:
              </label>
              <input
                type="text"
                value={orderCarrier}
                onChange={(e) => setOrderCarrier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Tên khách hàng:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Số điện thoại:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Địa chỉ giao hàng đầy đủ:
            </label>
            <textarea
              rows={2}
              value={fullAddress}
              onChange={handleAddressChange}
              placeholder="Số 48/12 Nguyễn Hữu Cảnh, P.22, Q.Bình Thạnh..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-amber-300 block mb-1">
                Tên đường / Cụm gom:
              </label>
              <input
                type="text"
                value={streetOrArea}
                onChange={(e) => setStreetOrArea(e.target.value)}
                placeholder="Nguyễn Hữu Cảnh"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-400 block mb-1">
                Tiền COD thu hộ (VNĐ):
              </label>
              <input
                type="number"
                step="1000"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Ghi chú hẹn giờ / Gấp:
            </label>
            <input
              type="text"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="VD: Giao sau 17h, Gọi trước 10p, Gấp trước trưa..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingOrder ? 'Lưu Thay Đổi' : 'Thêm Vào Danh Sách Giao'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
