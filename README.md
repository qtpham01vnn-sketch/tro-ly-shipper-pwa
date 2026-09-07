# 🚀 TRỢ LÝ SHIPPER THÔNG MINH (SMART SHIPPER ASSISTANT PWA)

Ứng dụng web di động tinh gọn (PWA / Mobile Web App) phục vụ trực tiếp cho nhân viên giao hàng (Shipper) chạy tuyến chặng cuối tại Việt Nam (Shopee Express, GHTK, GHN, Viettel Post, J&T, TikTok Shop...).

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. 📷 Batch OCR Engine (Quét & Trích xuất Vận đơn Hàng loạt)
- Cho phép chọn/chụp từ **10 đến 50 ảnh** phiếu gửi cùng lúc.
- Tích hợp **Google Gemini AI Vision** (mặc định model `gemini-1.5-flash` và hỗ trợ `gemini-2.5-flash`) phân tích và bóc tách thông tin cực nhanh:
  * Mã vận đơn (`trackingCode`)
  * Tên khách hàng (`customerName`) & Số điện thoại (`phone`)
  * Địa chỉ đầy đủ (`fullAddress`) & Tên đường/Cụm giao hàng (`streetOrArea`)
  * Tiền thu hộ COD (`codAmount`)
  * Tiền công giao của shipper trên mỗi đơn (`shippingFee`)
  * Ghi chú hẹn giờ (`deliveryNote`)
- Tích hợp sẵn **Chế độ Demo/Mock Engine**: Tự động nhận diện mô phỏng ngay cả khi chưa có hoặc chưa nhập Gemini API Key.

### 2. 🗺️ Route Clustering (Gom Cụm Phân Tuyến & Ưu Tiên Giao Hàng)
- Tự động gom các đơn có cùng tên đường, chung ngõ hẻm hoặc cùng tòa chung cư/khu đô thị (như Vinhomes, Masteri, Nguyễn Hữu Cảnh...).
- **Sắp xếp thông minh**: Các đơn có ghi chú hẹn giờ ("giao sau 17h", "giao gấp", "hẹn trước 11h30") được gắn tag màu cảnh báo nổi bật và tự động xếp lên đầu cụm.
- **Tùy chỉnh thứ tự tuyến**: Có nút di chuyển Lên/Xuống từng cụm để shipper dễ dàng xếp hàng lên xe máy theo thứ tự tiện đường nhất.

### 3. 🛵 Field Delivery UI (Giao Diện Thao Tác 1-Chạm Ngoài Đường)
- Thiết kế chuẩn **Mobile-first**, nút bấm to bản, độ tương phản cao, dễ bấm bằng một tay khi đang dừng xe:
  * **[Gọi điện]**: Bấm 1 chạm kích hoạt cuộc gọi `tel:<số_điện_thoại>`.
  * **[Chỉ đường]**: Bấm 1 chạm mở ứng dụng Google Maps dẫn đường chính xác tới địa chỉ nhận.
  * **[ĐÃ GIAO]**: Bấm 1 chạm xác nhận thành công, tự động cộng tiền công và tiền COD.
- **[Chưa giao]**: Mở Bottom Sheet nhanh với 4 nhóm lý do chuẩn:
  1. *Khách hẹn lại* (chọn nhanh giờ hẹn: chiều nay sau 17h, sáng mai...).
  2. *Thuê bao / Không nghe máy* (ghi nhận số lần gọi: 1, 2, 3 lần).
  3. *Khách từ chối nhận / Hủy đơn* (sai hàng, đổi ý, bom hàng...).
  4. *Sai thông tin địa chỉ / Không tìm thấy số nhà*.

### 4. 📊 Dashboard Doanh Thu & Bảng Đối Soát Cuối Ca
- **Sticky Header cố định trên cùng**:
  * Tiến độ giao: Đã giao X / Tổng số đơn (% hoàn thành).
  * Tiền công shipper kiếm được trong ngày: (Số đơn đã giao x Tiền công/đơn).
  * Tiền COD thu hộ phải nộp bưu cục: Tổng tiền COD của các đơn thành công.
- **Báo cáo cuối ca**:
  * Bảng tổng hợp Đã giao vs Chưa giao / Tồn.
  * Nút **"Sao chép báo cáo Zalo"**: Tự động xuất text mẫu chuẩn kèm danh sách chi tiết các đơn chưa giao (mã, tên, số điện thoại, lý do) để dán gửi nhóm Zalo nội bộ/thủ kho.
  * Nút **"Tải file Excel/CSV"**: Xuất file CSV chuẩn UTF-8 có dấu tiếng Việt, tương thích hoàn toàn với Microsoft Excel.

### 5. 💾 Lưu Trữ Offline & Cài Đặt PWA
- Toàn bộ dữ liệu được đồng bộ liên tục vào `localStorage` của trình duyệt.
- Hỗ trợ cài đặt PWA ra Màn hình chính (Add to Home Screen) trên cả iOS và Android.

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Khởi động môi trường phát triển (Dev Mode):
```bash
npm run dev
```
Ứng dụng sẽ chạy tại `http://localhost:3000`.

### 2. Đóng gói bản Production:
```bash
npm run build
```

---

## 📱 HƯỚNG DẪN LƯU APP RA MÀN HÌNH CHÍNH (PWA)

### Trên iPhone / iPad (Safari):
1. Mở link ứng dụng bằng trình duyệt **Safari**.
2. Bấm vào biểu tượng nút **"Chia sẻ"** (hình vuông có mũi tên trỏ lên ở thanh đáy).
3. Cuộn danh sách xuống và chọn **"Thêm vào MH chính"** (*Add to Home Screen*).
4. Bấm **"Thêm"** (*Add*) ở góc trên bên phải.

### Trên Android (Google Chrome):
1. Mở link ứng dụng bằng trình duyệt **Chrome**.
2. Bấm vào nút **Menu 3 chấm** ở góc trên cùng bên phải.
3. Chọn **"Cài đặt ứng dụng"** (*Install app*) hoặc **"Thêm vào màn hình chính"** (*Add to Home screen*).
