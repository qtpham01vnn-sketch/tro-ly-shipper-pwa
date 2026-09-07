import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Package, 
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  FileText
} from 'lucide-react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ClusterView from './components/ClusterView';
import DailyLogbookView from './components/DailyLogbookView';
import TCVNReportModal from './components/TCVNReportModal';
import BatchScannerModal from './components/BatchScannerModal';
import FailReasonModal from './components/FailReasonModal';
import DailyReportModal from './components/DailyReportModal';
import SettingsModal from './components/SettingsModal';
import AddOrderModal from './components/AddOrderModal';
import PWAInstallGuideModal from './components/PWAInstallGuideModal';

import { INITIAL_SAMPLE_ORDERS } from './data/sampleOrders';
import { saveDailyLog } from './services/historyService';

// Khóa lưu trữ LocalStorage
const STORAGE_ORDERS_KEY = 'shipper_app_orders_v1';
const STORAGE_CONFIG_KEY = 'shipper_app_config_v1';
const STORAGE_CLUSTER_ORDER_KEY = 'shipper_app_cluster_order_v1';

export default function App() {
  // 1. Quản lý View điều hướng chính ('delivery' | 'logbook')
  const [activeView, setActiveView] = useState('delivery');

  // 2. Quản lý State Cấu hình ứng dụng
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Lỗi đọc config:', e);
    }
    return {
      apiKey: '',
      shippingWage: 4500,
      baseSalary: 5000000,
      shipperName: 'Thiên Long',
      carrier: 'J&T Express',
      selectedModel: 'gemini-1.5-flash'
    };
  });

  // 3. Quản lý State Đơn hàng (Lưu liên tục vào localStorage)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc orders:', e);
    }
    return INITIAL_SAMPLE_ORDERS;
  });

  // 4. Thứ tự cụm đường do shipper tự sắp xếp
  const [customClusterSequence, setCustomClusterSequence] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLUSTER_ORDER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Lỗi đọc cluster sequence:', e);
    }
    return [];
  });

  // 5. Điểm xuất phát của bưu cục / kho hàng
  const [startingPoint, setStartingPoint] = useState(() => {
    return localStorage.getItem('shipper_starting_point_v1') || 'Bưu cục J&T / Kho Bình Đa';
  });

  // Tự động lưu nhật ký ngày mỗi khi trạng thái đơn thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
      if (orders.length > 0) {
        saveDailyLog({
          date: new Date().toISOString().split('T')[0],
          shipperName: config.shipperName,
          carrier: config.carrier,
          orders,
          shippingWage: config.shippingWage,
          baseSalary: config.baseSalary || 5000000
        });
      }
    } catch (e) {
      console.error('Lỗi ghi orders vào storage:', e);
    }
  }, [orders, config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Lỗi ghi config vào storage:', e);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLUSTER_ORDER_KEY, JSON.stringify(customClusterSequence));
    } catch (e) {
      console.error('Lỗi ghi cluster sequence:', e);
    }
  }, [customClusterSequence]);

  useEffect(() => {
    try {
      localStorage.setItem('shipper_starting_point_v1', startingPoint);
    } catch (e) {}
  }, [startingPoint]);

  // 6. Quản lý Bộ lọc & Tìm kiếm
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'delivered' | 'failed'
  const [searchQuery, setSearchQuery] = useState('');

  // 7. Quản lý Trạng thái hiển thị các Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTCVNReportOpen, setIsTCVNReportOpen] = useState(false);
  const [tcvnReportData, setTcvnReportData] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [failModalOrder, setFailModalOrder] = useState(null);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  // Cập nhật trạng thái "Đã giao thành công"
  const handleMarkDelivered = (orderId) => {
    triggerHaptic();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered', failReason: '' } : o))
    );

    const remainingPending = orders.filter((o) => o.id !== orderId && o.status === 'pending').length;
    if (remainingPending === 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Ghi nhận lý do chưa giao
  const handleSubmitFailReason = (orderId, reason, callAttempts) => {
    triggerHaptic();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'failed', failReason: reason, callAttempts: callAttempts || o.callAttempts }
          : o
      )
    );
  };

  // Hoàn tác trạng thái về 'pending'
  const handleUndoStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'pending', failReason: '' } : o))
    );
  };

  // Thêm nhiều đơn hàng từ OCR vào danh sách (loại bỏ trùng lặp)
  const handleAddBatchOrders = (newOrders) => {
    setOrders((prev) => {
      const existingCodes = new Set(prev.map((o) => o.trackingCode).filter(Boolean));
      const filteredNew = newOrders.filter((o) => !o.trackingCode || !existingCodes.has(o.trackingCode));
      return [...filteredNew, ...prev];
    });
  };

  // Thêm hoặc sửa 1 đơn hàng thủ công
  const handleSaveSingleOrder = (orderData) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === orderData.id);
      if (exists) {
        return prev.map((o) => (o.id === orderData.id ? orderData : o));
      }
      return [orderData, ...prev];
    });
  };

  // Xóa 1 đơn hàng
  const handleDeleteOrder = (orderId) => {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  // Chốt ca & Lưu vào Sổ Lịch Sử
  const handleResetDay = () => {
    if (orders.length > 0) {
      saveDailyLog({
        date: new Date().toISOString().split('T')[0],
        shipperName: config.shipperName,
        carrier: config.carrier,
        orders,
        shippingWage: config.shippingWage,
        baseSalary: config.baseSalary || 5000000
      });
    }
    setOrders([]);
    setCustomClusterSequence([]);
  };

  // Mở modal in biên bản TCVN
  const handleOpenTCVNReport = (
    customOrders = orders, 
    customWage = config.shippingWage, 
    customSalary = (config.baseSalary || 5000000), 
    customShipper = config.shipperName, 
    customCarrier = config.carrier,
    customDate = new Date()
  ) => {
    setTcvnReportData({
      orders: customOrders,
      shippingWage: customWage,
      baseSalary: customSalary,
      shipperName: customShipper,
      carrier: customCarrier,
      date: customDate
    });
    setIsTCVNReportOpen(true);
  };

  // 8. Thuật toán Gom cụm & Phân tuyến thông minh
  const clusters = useMemo(() => {
    let filtered = orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q)) ||
        (o.fullAddress && o.fullAddress.toLowerCase().includes(q)) ||
        (o.streetOrArea && o.streetOrArea.toLowerCase().includes(q))
      );
    });

    if (filterTab === 'pending') {
      filtered = filtered.filter((o) => o.status === 'pending');
    } else if (filterTab === 'delivered') {
      filtered = filtered.filter((o) => o.status === 'delivered');
    } else if (filterTab === 'failed') {
      filtered = filtered.filter((o) => o.status === 'failed');
    }

    const clusterMap = new Map();

    filtered.forEach((order) => {
      const areaKey = (order.streetOrArea || 'Khu vực khác').trim();
      if (!clusterMap.has(areaKey)) {
        clusterMap.set(areaKey, []);
      }
      clusterMap.get(areaKey).push(order);
    });

    // Sắp xếp đơn trong từng cụm: Đơn hẹn giờ / gấp lên đầu cụm
    clusterMap.forEach((orderList) => {
      orderList.sort((a, b) => {
        const isAUrgent = Boolean(
          a.deliveryNote && 
          (a.deliveryNote.toLowerCase().includes('gấp') ||
           a.deliveryNote.toLowerCase().includes('hẹn') ||
           a.deliveryNote.toLowerCase().includes('trước') ||
           a.deliveryNote.toLowerCase().includes('giờ'))
        );
        const isBUrgent = Boolean(
          b.deliveryNote && 
          (b.deliveryNote.toLowerCase().includes('gấp') ||
           b.deliveryNote.toLowerCase().includes('hẹn') ||
           b.deliveryNote.toLowerCase().includes('trước') ||
           b.deliveryNote.toLowerCase().includes('giờ'))
        );

        if (isAUrgent && !isBUrgent) return -1;
        if (!isAUrgent && isBUrgent) return 1;
        return 0;
      });
    });

    const clusterArray = [];
    const processedKeys = new Set();

    customClusterSequence.forEach((key) => {
      if (clusterMap.has(key)) {
        clusterArray.push({ name: key, orders: clusterMap.get(key) });
        processedKeys.add(key);
      }
    });

    clusterMap.forEach((ordersInArea, key) => {
      if (!processedKeys.has(key)) {
        clusterArray.push({ name: key, orders: ordersInArea });
      }
    });

    // Cụm nào có đơn hẹn giờ thì tự động đưa lên đầu lộ trình nếu chưa được xếp
    clusterArray.sort((a, b) => {
      const aHasUrgent = a.orders.some((o) => o.deliveryNote && (o.deliveryNote.toLowerCase().includes('gấp') || o.deliveryNote.toLowerCase().includes('hẹn') || o.deliveryNote.toLowerCase().includes('trước')));
      const bHasUrgent = b.orders.some((o) => o.deliveryNote && (o.deliveryNote.toLowerCase().includes('gấp') || o.deliveryNote.toLowerCase().includes('hẹn') || o.deliveryNote.toLowerCase().includes('trước')));
      if (aHasUrgent && !bHasUrgent) return -1;
      if (!aHasUrgent && bHasUrgent) return 1;
      return 0;
    });

    return clusterArray;
  }, [orders, searchQuery, filterTab, customClusterSequence]);

  const handleMoveCluster = (index, direction) => {
    const newClusters = [...clusters];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newClusters.length) return;

    const temp = newClusters[index];
    newClusters[index] = newClusters[targetIndex];
    newClusters[targetIndex] = temp;

    const newSequence = newClusters.map((c) => c.name);
    setCustomClusterSequence(newSequence);
  };

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    failed: orders.filter((o) => o.status === 'failed').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row selection:bg-sky-500 selection:text-white">
      {/* 1. THANH ĐIỀU HƯỚNG BÊN TRÁI (LEFT SIDEBAR & MOBILE NAV) */}
      <Sidebar
        activeView={activeView}
        onChangeView={(view) => setActiveView(view)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenTCVNReport={() => handleOpenTCVNReport()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddOrder={() => {
          setEditingOrder(null);
          setIsAddOrderOpen(true);
        }}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        orders={orders}
        shippingWage={config.shippingWage}
        baseSalary={config.baseSalary || 5000000}
        shipperName={config.shipperName}
        carrier={config.carrier}
      />

      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Sticky Header Doanh Thu */}
        <Header
          orders={orders}
          shippingWage={config.shippingWage}
          shipperName={config.shipperName}
          carrier={config.carrier}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAddOrder={() => {
            setEditingOrder(null);
            setIsAddOrderOpen(true);
          }}
          onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        />

        {/* Nội dung thay đổi theo Tab: 'delivery' hoặc 'logbook' */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 py-3 space-y-3">
          {activeView === 'delivery' ? (
            <>
              {/* Thanh tìm kiếm nhanh */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên khách, số điện thoại, mã đơn, tên đường..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded-full"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 4 Tabs Lọc Trạng Thái Nhanh */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
                    filterTab === 'all'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>Tất cả</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                    {counts.all}
                  </span>
                </button>

                <button
                  onClick={() => setFilterTab('pending')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
                    filterTab === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chờ giao</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                    {counts.pending}
                  </span>
                </button>

                <button
                  onClick={() => setFilterTab('delivered')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
                    filterTab === 'delivered'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã giao</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                    {counts.delivered}
                  </span>
                </button>

                <button
                  onClick={() => setFilterTab('failed')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
                    filterTab === 'failed'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Chưa giao / Tồn</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                    {counts.failed}
                  </span>
                </button>

                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Chốt ca và lưu dữ liệu vào Sổ Nhật Ký để bắt đầu ca mới?')) {
                        handleResetDay();
                      }
                    }}
                    className="ml-auto px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 whitespace-nowrap transition flex items-center gap-1 shrink-0"
                    title="Chốt ca và lưu vào sổ"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Chốt ca & Xóa</span>
                  </button>
                )}
              </div>

              {/* Phân Hệ Tuyến Đường & Gom Cụm (Cluster View) */}
              <ClusterView
                clusters={clusters}
                startingPoint={startingPoint}
                onChangeStartingPoint={() => {
                  const newPoint = prompt('Nhập tên Bưu cục / Kho hàng xuất phát:', startingPoint);
                  if (newPoint && newPoint.trim()) {
                    setStartingPoint(newPoint.trim());
                  }
                }}
                onMoveCluster={handleMoveCluster}
                onMarkDelivered={handleMarkDelivered}
                onOpenFailModal={(order) => setFailModalOrder(order)}
                onUndoStatus={handleUndoStatus}
                onEditOrder={(order) => {
                  setEditingOrder(order);
                  setIsAddOrderOpen(true);
                }}
                onDeleteOrder={handleDeleteOrder}
              />
            </>
          ) : (
            /* Phân Hệ Sổ Nhật Ký & Lương Các Ngày (Daily Logbook View) */
            <DailyLogbookView
              baseSalary={config.baseSalary || 5000000}
              shippingWage={config.shippingWage}
              shipperName={config.shipperName}
              carrier={config.carrier}
              currentDayOrders={orders}
              onOpenTCVNReport={(logOrders, wage, sal, name, carr, d) => 
                handleOpenTCVNReport(logOrders, wage, sal, name, carr, d)
              }
            />
          )}
        </main>
      </div>

      {/* 3. CÁC MODALS VÀ BIÊN BẢN IN */}
      {/* Modal In Biên Bản Chuẩn TCVN */}
      <TCVNReportModal
        isOpen={isTCVNReportOpen}
        onClose={() => setIsTCVNReportOpen(false)}
        orders={tcvnReportData?.orders || orders}
        shippingWage={tcvnReportData?.shippingWage || config.shippingWage}
        baseSalary={tcvnReportData?.baseSalary || (config.baseSalary || 5000000)}
        shipperName={tcvnReportData?.shipperName || config.shipperName}
        carrier={tcvnReportData?.carrier || config.carrier}
        date={tcvnReportData?.date || new Date()}
      />

      {/* Modal Quét Phiếu Gửi AI OCR */}
      <BatchScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddOrders={handleAddBatchOrders}
        apiKey={config.apiKey}
        defaultShippingFee={config.shippingWage}
        selectedModel={config.selectedModel}
        onSaveApiKey={(key) => setConfig((prev) => ({ ...prev, apiKey: key }))}
      />

      {/* Modal Báo Cáo Cuối Ca */}
      <DailyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        orders={orders}
        shippingWage={config.shippingWage}
        shipperName={config.shipperName}
        carrier={config.carrier}
        onResetDay={handleResetDay}
      />

      {/* Modal Cài Đặt Hệ Thống */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => setConfig(newConfig)}
        onLoadSampleData={() => {}}
        onClearAllData={handleResetDay}
      />

      {/* Modal Thêm/Sửa Đơn Thủ Công */}
      <AddOrderModal
        isOpen={isAddOrderOpen}
        onClose={() => {
          setIsAddOrderOpen(false);
          setEditingOrder(null);
        }}
        onSaveOrder={handleSaveSingleOrder}
        editingOrder={editingOrder}
        defaultShippingFee={config.shippingWage}
        carrier={config.carrier}
      />

      {/* Bottom Sheet Lý Do Chưa Giao */}
      <FailReasonModal
        isOpen={Boolean(failModalOrder)}
        order={failModalOrder}
        onClose={() => setFailModalOrder(null)}
        onSubmitFailReason={handleSubmitFailReason}
      />

      {/* Hướng Dẫn Cài Đặt PWA Ra Màn Hình Chính */}
      <PWAInstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />
    </div>
  );
}
