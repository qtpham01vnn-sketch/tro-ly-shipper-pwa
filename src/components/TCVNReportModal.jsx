import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  Wallet
} from 'lucide-react';
import { formatVND } from '../services/exportService';

export default function TCVNReportModal({
  isOpen,
  onClose,
  orders = [],
  shippingWage = 4500,
  baseSalary = 5000000,
  shipperName = 'Shipper Pro',
  carrier = 'J&T Express',
  date = new Date()
}) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const failedOrders = orders.filter((o) => o.status === 'failed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const deliveredCount = deliveredOrders.length;
  const failedCount = failedOrders.length;
  const successRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

  // Tính tài chính
  const totalDeliveredCOD = deliveredOrders.reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);
  const cashDeliveredCOD = deliveredOrders
    .filter((o) => (o.paymentMethod || 'cash') === 'cash')
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);
  const transferDeliveredCOD = deliveredOrders
    .filter((o) => o.paymentMethod === 'transfer')
    .reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);

  const totalTip = deliveredOrders.reduce((sum, o) => sum + (Number(o.tipAmount) || 0), 0);
  const totalShipperWage = deliveredCount * shippingWage;
  const totalIncome = baseSalary + totalShipperWage + totalTip;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Biên Bản Báo Cáo & Đối Soát (Chuẩn Thể Thức TCVN)
              </h3>
              <p className="text-xs text-slate-400">Trình bày theo thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>In Ra Giấy / Xuất PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Khung tài liệu hiển thị dạng trang A4 trắng */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-800/40">
          <div 
            ref={printRef}
            className="bg-white text-black p-6 sm:p-10 rounded-2xl shadow-2xl max-w-3xl mx-auto font-serif text-[13px] leading-relaxed border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* TIÊU NGỮ & QUỐC HIỆU CHUẨN TCVN */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-black/20">
              <div className="text-center">
                <p className="font-bold uppercase text-[12px]">{carrier.toUpperCase()}</p>
                <p className="font-bold text-[11px] text-gray-700 uppercase">BƯU CỤC TUYẾN BIÊN HÒA - ĐỒNG NAI</p>
                <p className="text-[11px] text-gray-600 italic">Số: {dateObj.getTime().toString().slice(-6)}/BB-DSGH</p>
              </div>

              <div className="text-center">
                <p className="font-bold uppercase text-[12px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="font-bold text-[12px] underline decoration-1 underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[11px] italic text-gray-600 mt-2">
                  Đồng Nai, ngày {day} tháng {month} năm {year}
                </p>
              </div>
            </div>

            {/* TÊN VĂN BẢN */}
            <div className="text-center my-6 space-y-1">
              <h1 className="font-bold text-lg uppercase tracking-wide">
                BIÊN BẢN BÀN GIAO ĐỐI SOÁT VẬN ĐƠN & QUYẾT TOÁN CÔNG NHẬT
              </h1>
              <p className="italic text-xs text-gray-700">
                (Kèm theo bảng kê chi tiết thu hộ COD và danh sách đơn hàng hoàn tồn ca ngày {dateFormatted})
              </p>
            </div>

            {/* PHẦN I: THÔNG TIN CHUNG */}
            <div className="space-y-1.5 mb-5">
              <h2 className="font-bold uppercase text-xs">I. THÔNG TIN GIAO NHẬN & ĐIỀU PHỐI</h2>
              <div className="grid grid-cols-2 gap-2 text-xs border border-gray-300 p-2.5 rounded bg-gray-50/50">
                <p>• <strong>Nhân viên giao hàng (Shipper):</strong> {shipperName}</p>
                <p>• <strong>Đơn vị vận chuyển:</strong> {carrier}</p>
                <p>• <strong>Tuyến phụ trách:</strong> Phường Bình Đa - Tam Hiệp - TP. Biên Hòa</p>
                <p>• <strong>Ngày đối soát:</strong> {dateFormatted}</p>
              </div>
            </div>

            {/* PHẦN II: TỔNG HỢP VẬN ĐƠN */}
            <div className="space-y-2 mb-5">
              <h2 className="font-bold uppercase text-xs">II. TỔNG HỢP KẾT QUẢ PHÁT HÀNG TRONG CA</h2>
              <table className="w-full border-collapse border border-black text-xs text-center">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="border border-black p-1.5">Tổng đơn nhận</th>
                    <th className="border border-black p-1.5">Giao thành công</th>
                    <th className="border border-black p-1.5">Chưa giao / Hoàn tồn</th>
                    <th className="border border-black p-1.5">Đang chờ giao</th>
                    <th className="border border-black p-1.5">Tỷ lệ thành công</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 font-bold">{totalOrders} đơn</td>
                    <td className="border border-black p-2 font-bold text-green-700">{deliveredCount} đơn</td>
                    <td className="border border-black p-2 font-bold text-red-600">{failedCount} đơn</td>
                    <td className="border border-black p-2">{pendingOrders.length} đơn</td>
                    <td className="border border-black p-2 font-bold">{successRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PHẦN III: BẢNG KÊ ĐỐI SOÁT TÀI CHÍNH & LƯƠNG */}
            <div className="space-y-2 mb-5">
              <h2 className="font-bold uppercase text-xs">III. BẢNG KÊ QUYẾT TOÁN TÀI CHÍNH & CÔNG NHẬT</h2>
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100 font-bold text-center">
                    <th className="border border-black p-1.5 w-10">STT</th>
                    <th className="border border-black p-1.5">Nội dung đối soát tài chính</th>
                    <th className="border border-black p-1.5 w-28 text-center">Đơn giá / Định mức</th>
                    <th className="border border-black p-1.5 w-32 text-right">Thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5 text-center font-bold">1</td>
                    <td className="border border-black p-1.5">
                      <strong>Tổng tiền thu hộ COD phát sinh trong ca</strong>
                      <div className="text-[11px] text-gray-600 italic">Tổng phát sinh từ {deliveredCount} đơn giao thành công</div>
                    </td>
                    <td className="border border-black p-1.5 text-center font-semibold">Theo thực tế</td>
                    <td className="border border-black p-1.5 text-right font-bold text-blue-700">
                      {formatVND(totalDeliveredCOD)}
                    </td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="border border-black p-1.5 text-center text-gray-600">1.1</td>
                    <td className="border border-black p-1.5 pl-4">
                      <strong>• Tiền mặt thực tế bàn nộp thủ quỹ bưu cục (Két tiền)</strong>
                      <div className="text-[11px] text-gray-600 italic">Số tiền mặt shipper trực tiếp bàn giao lại kho</div>
                    </td>
                    <td className="border border-black p-1.5 text-center font-bold text-amber-800">Tiền mặt</td>
                    <td className="border border-black p-1.5 text-right font-black text-amber-900">
                      {formatVND(cashDeliveredCOD)}
                    </td>
                  </tr>
                  <tr className="bg-sky-50/50">
                    <td className="border border-black p-1.5 text-center text-gray-600">1.2</td>
                    <td className="border border-black p-1.5 pl-4">
                      <strong>• Tiền khách đã chuyển khoản ngân hàng</strong>
                      <div className="text-[11px] text-gray-600 italic">Đã vào tài khoản cá nhân/VietQR (đối soát trừ riêng)</div>
                    </td>
                    <td className="border border-black p-1.5 text-center font-bold text-sky-800">Chuyển khoản</td>
                    <td className="border border-black p-1.5 text-right font-bold text-sky-900">
                      {formatVND(transferDeliveredCOD)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center font-bold">2</td>
                    <td className="border border-black p-1.5">
                      <strong>Lương cứng cố định hàng tháng</strong>
                      <div className="text-[11px] text-gray-600 italic">Mức lương cơ bản thỏa thuận</div>
                    </td>
                    <td className="border border-black p-1.5 text-center">Định mức tháng</td>
                    <td className="border border-black p-1.5 text-right font-semibold">
                      {formatVND(baseSalary)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center font-bold">3</td>
                    <td className="border border-black p-1.5">
                      <strong>Tiền công phát hàng ca hôm nay (Sản lượng)</strong>
                      <div className="text-[11px] text-gray-600 italic">Tính trên {deliveredCount} đơn x {formatVND(shippingWage)}/đơn</div>
                    </td>
                    <td className="border border-black p-1.5 text-center">+{formatVND(shippingWage)}/đơn</td>
                    <td className="border border-black p-1.5 text-right font-bold text-amber-700">
                      +{formatVND(totalShipperWage)}
                    </td>
                  </tr>
                  {totalTip > 0 && (
                    <tr className="bg-amber-50/40">
                      <td className="border border-black p-1.5 text-center font-bold">4</td>
                      <td className="border border-black p-1.5">
                        <strong>Tiền Tip / Khách thưởng thêm (Thu nhập cá nhân Shipper)</strong>
                        <div className="text-[11px] text-gray-600 italic">Tiền bo thực tế của khách trong ca (bỏ túi riêng)</div>
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold text-amber-800">Thưởng thêm</td>
                      <td className="border border-black p-1.5 text-right font-bold text-amber-800">
                        +{formatVND(totalTip)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-100 font-bold text-sm">
                    <td colSpan={3} className="border border-black p-2 text-right uppercase">
                      TỔNG THU NHẬP SHIPPER TÍCH LŨY (Lương cứng + Tiền công {totalTip > 0 ? '+ Tiền Tip' : ''}):
                    </td>
                    <td className="border border-black p-2 text-right text-green-700 font-black">
                      {formatVND(totalIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PHẦN IV: CHI TIẾT ĐƠN HOÀN TỒN */}
            {failedCount > 0 && (
              <div className="space-y-2 mb-6">
                <h2 className="font-bold uppercase text-xs">IV. BẢNG KÊ CHI TIẾT {failedCount} ĐƠN HOÀN / TỒN VỀ KHO</h2>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 font-bold text-center">
                      <th className="border border-black p-1 w-8">STT</th>
                      <th className="border border-black p-1 w-24">Mã vận đơn</th>
                      <th className="border border-black p-1">Khách hàng & SĐT</th>
                      <th className="border border-black p-1">Địa chỉ</th>
                      <th className="border border-black p-1 w-48">Lý do chưa giao được</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedOrders.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-black p-1 font-mono font-bold text-center">{item.trackingCode}</td>
                        <td className="border border-black p-1 font-semibold">{item.customerName} - {item.phone}</td>
                        <td className="border border-black p-1">{item.fullAddress}</td>
                        <td className="border border-black p-1 text-red-600 font-semibold">{item.failReason || 'Khách chưa nhận'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* LỜI CAM KẾT VÀ CHỮ KÝ 2 BÊN */}
            <p className="italic text-xs text-gray-700 mb-8">
              Hai bên đã tiến hành kiểm đếm chính xác toàn bộ số tiền mặt COD và hiện vật hàng tồn bàn giao về kho, không có khiếu nại phát sinh.
            </p>

            <div className="grid grid-cols-2 gap-8 text-center text-xs pb-10">
              <div>
                <p className="font-bold uppercase">NGƯỜI LẬP BIÊN BẢN / SHIPPER</p>
                <p className="italic text-[11px] text-gray-600">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
                <p className="font-bold text-sm">{shipperName}</p>
              </div>

              <div>
                <p className="font-bold uppercase">ĐẠI DIỆN BƯU CỤC / THỦ KHO</p>
                <p className="italic text-[11px] text-gray-600">(Ký xác nhận và đóng dấu)</p>
                <div className="h-16"></div>
                <p className="font-bold text-sm">...........................................</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>In Biên Bản A4 / Lưu PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
