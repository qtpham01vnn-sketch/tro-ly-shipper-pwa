import React, { useState } from 'react';
import { 
  X, 
  CalendarClock, 
  PhoneOff, 
  UserX, 
  MapPinOff, 
  Check, 
  AlertOctagon,
  PhoneCall
} from 'lucide-react';

export default function FailReasonModal({
  isOpen,
  order,
  onClose,
  onSubmitFailReason
}) {
  const [selectedType, setSelectedType] = useState('reschedule'); // 'reschedule' | 'no_answer' | 'refused' | 'wrong_address'
  const [rescheduleTime, setRescheduleTime] = useState('Hẹn giao chiều nay (sau 17h)');
  const [callAttempts, setCallAttempts] = useState(order?.callAttempts || 2);
  const [refusalReason, setRefusalReason] = useState('Khách đổi ý không muốn mua nữa');
  const [addressReason, setAddressReason] = useState('Không tìm thấy số nhà / Hẻm sâu không vào được');
  const [customNote, setCustomNote] = useState('');

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    let finalReason = '';
    let finalCalls = 0;

    switch (selectedType) {
      case 'reschedule':
        finalReason = `Khách hẹn lại: ${rescheduleTime}${customNote ? ` (${customNote})` : ''}`;
        break;
      case 'no_answer':
        finalReason = `Thuê bao / Không nghe máy (Đã gọi ${callAttempts} lần)`;
        finalCalls = callAttempts;
        break;
      case 'refused':
        finalReason = `Khách từ chối nhận / Hủy đơn: ${refusalReason}${customNote ? ` (${customNote})` : ''}`;
        break;
      case 'wrong_address':
        finalReason = `Sai thông tin địa chỉ: ${addressReason}${customNote ? ` (${customNote})` : ''}`;
        break;
      default:
        finalReason = customNote || 'Chưa giao được';
    }

    onSubmitFailReason(order.id, finalReason, finalCalls);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Ghi Nhận Lý Do Chưa Giao</h3>
              <p className="text-xs text-slate-400">
                Đơn: <strong className="text-sky-400">{order.trackingCode}</strong> • {order.customerName}
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

        {/* Nội dung chọn 4 phân loại thất bại */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* 4 Nút danh mục chính lớn */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Loại 1: Khách hẹn lại */}
            <button
              type="button"
              onClick={() => setSelectedType('reschedule')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                selectedType === 'reschedule'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <CalendarClock className="w-5 h-5 text-amber-400" />
                {selectedType === 'reschedule' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <span className="font-extrabold text-xs">1. Khách Hẹn Lại</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Đổi giờ/ngày giao</span>
            </button>

            {/* Loại 2: Không nghe máy */}
            <button
              type="button"
              onClick={() => setSelectedType('no_answer')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                selectedType === 'no_answer'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <PhoneOff className="w-5 h-5 text-rose-400" />
                {selectedType === 'no_answer' && <Check className="w-4 h-4 text-rose-400" />}
              </div>
              <span className="font-extrabold text-xs">2. Không Nghe Máy</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Thuê bao / Tắt máy</span>
            </button>

            {/* Loại 3: Từ chối nhận */}
            <button
              type="button"
              onClick={() => setSelectedType('refused')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                selectedType === 'refused'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <UserX className="w-5 h-5 text-purple-400" />
                {selectedType === 'refused' && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <span className="font-extrabold text-xs">3. Khách Từ Chối</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Hủy đơn / Sai hàng</span>
            </button>

            {/* Loại 4: Sai địa chỉ */}
            <button
              type="button"
              onClick={() => setSelectedType('wrong_address')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                selectedType === 'wrong_address'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <MapPinOff className="w-5 h-5 text-blue-400" />
                {selectedType === 'wrong_address' && <Check className="w-4 h-4 text-blue-400" />}
              </div>
              <span className="font-extrabold text-xs">4. Sai Địa Chỉ</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Không tìm thấy số nhà</span>
            </button>
          </div>

          {/* Chi tiết phụ thuộc vào danh mục đã chọn */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            {/* Phân nhánh 1: Khách hẹn lại */}
            {selectedType === 'reschedule' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 block">
                  Chọn nhanh thời gian khách hẹn:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Hẹn chiều nay (sau 17h)',
                    'Hẹn sáng mai',
                    'Hẹn chiều mai',
                    'Hẹn cuối tuần (Thứ 7 / CN)'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRescheduleTime(preset)}
                      className={`p-2 rounded-xl text-[11px] font-bold border text-left transition ${
                        rescheduleTime === preset
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phân nhánh 2: Không nghe máy */}
            {selectedType === 'no_answer' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-300">
                    Số lần đã bấm gọi:
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full">
                    {callAttempts} cuộc gọi
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCallAttempts(num)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                        callAttempts === num
                          ? 'bg-rose-500 text-white border-rose-400 font-extrabold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{num} lần</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phân nhánh 3: Khách từ chối */}
            {selectedType === 'refused' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-300 block">
                  Lý do từ chối:
                </label>
                <div className="space-y-1.5">
                  {[
                    'Khách đổi ý không muốn mua nữa',
                    'Khách bảo không đặt đơn hàng này (Bom hàng)',
                    'Sai mẫu mã / Sai kích thước yêu cầu',
                    'Khách không đủ tiền mặt thanh toán'
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setRefusalReason(reason)}
                      className={`w-full p-2 rounded-xl text-[11px] font-bold border text-left transition ${
                        refusalReason === reason
                          ? 'bg-purple-500 text-white border-purple-400 font-extrabold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phân nhánh 4: Sai địa chỉ */}
            {selectedType === 'wrong_address' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-300 block">
                  Chi tiết vấn đề địa chỉ:
                </label>
                <div className="space-y-1.5">
                  {[
                    'Không tìm thấy số nhà / Hẻm sâu không vào được',
                    'Sai tên đường / Nhầm quận huyện',
                    'Khách đã chuyển chỗ ở đi nơi khác'
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setAddressReason(reason)}
                      className={`w-full p-2 rounded-xl text-[11px] font-bold border text-left transition ${
                        addressReason === reason
                          ? 'bg-blue-500 text-white border-blue-400 font-extrabold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ghi chú thêm bằng tay nếu cần */}
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                Ghi chú thêm (tùy chọn):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="VD: Gọi máy bận, người nhà bảo đi công tác..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Hủy Bỏ
          </button>
          
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Xác Nhận Chưa Giao</span>
          </button>
        </div>
      </div>
    </div>
  );
}
