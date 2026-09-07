import React, { useState } from 'react';
import { 
  MapPinned, 
  ChevronDown, 
  ChevronUp, 
  ArrowUp, 
  ArrowDown, 
  Package, 
  AlertCircle,
  Clock,
  Sparkles,
  Navigation,
  Warehouse,
  MapPin,
  Route,
  Compass
} from 'lucide-react';
import OrderCard from './OrderCard';
import { formatVND } from '../services/exportService';

export default function ClusterView({
  clusters = [],
  startingPoint = 'Kho Bưu Cục / Điểm Xuất Phát',
  onChangeStartingPoint,
  onMoveCluster,
  onMarkDelivered,
  onOpenFailModal,
  onUndoStatus,
  onEditOrder,
  onDeleteOrder
}) {
  const [collapsedClusters, setCollapsedClusters] = useState({});

  const toggleCollapse = (clusterName) => {
    setCollapsedClusters((prev) => ({
      ...prev,
      [clusterName]: !prev[clusterName]
    }));
  };

  if (clusters.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 my-4">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-300">Chưa có đơn hàng nào trong danh sách</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Bấm nút "Quét Đơn Hàng Loạt" hoặc "Thêm Thủ Công" ở trên để bắt đầu ca giao hàng.
        </p>
      </div>
    );
  }

  // Tạo liên kết mở toàn bộ lộ trình trên Google Maps
  const firstPendingOrder = clusters.flatMap((c) => c.orders).find((o) => o.status === 'pending');
  const googleMapsRouteUrl = firstPendingOrder 
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(firstPendingOrder.fullAddress)}`
    : '#';

  return (
    <div className="space-y-3.5 pb-24">
      {/* BANNER ĐIỂM XUẤT PHÁT & LỘ TRÌNH THÔNG MINH */}
      <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/40 border border-sky-500/30 rounded-2xl space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Warehouse className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Điểm Xuất Phát (Bắt đầu ca)
              </div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{startingPoint}</span>
                <button
                  onClick={onChangeStartingPoint}
                  className="text-[10px] text-sky-400 hover:underline font-normal"
                >
                  [Đổi]
                </button>
              </div>
            </div>
          </div>

          <a
            href={googleMapsRouteUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-sky-500/20 active:scale-95 transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Chỉ Đường Đơn Đầu</span>
          </a>
        </div>

        {/* Lộ trình tóm tắt theo thứ tự đi */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
            <Route className="w-3 h-3 text-amber-400" />
            <span>Thứ tự tuyến giao đề xuất:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold whitespace-nowrap">
              Kho phát
            </span>
            {clusters.map((cluster, idx) => {
              const hasUrgent = cluster.orders.some((o) => 
                o.deliveryNote && 
                o.status === 'pending' &&
                (o.deliveryNote.toLowerCase().includes('gấp') || 
                 o.deliveryNote.toLowerCase().includes('hẹn') || 
                 o.deliveryNote.toLowerCase().includes('trước') || 
                 o.deliveryNote.toLowerCase().includes('giờ'))
              );

              return (
                <React.Fragment key={cluster.name}>
                  <span className="text-slate-600">➔</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap flex items-center gap-1 ${
                    hasUrgent
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800/80 text-sky-300 border border-slate-700'
                  }`}>
                    {idx + 1}. {cluster.name}
                    {hasUrgent && <Clock className="w-3 h-3 text-slate-950" />}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* DANH SÁCH CÁC CỤM TUYẾN ĐƯỜNG */}
      {clusters.map((cluster, index) => {
        const isCollapsed = Boolean(collapsedClusters[cluster.name]);
        const totalInCluster = cluster.orders.length;
        const deliveredInCluster = cluster.orders.filter((o) => o.status === 'delivered').length;
        const codInCluster = cluster.orders.reduce((sum, o) => sum + (Number(o.codAmount) || 0), 0);

        const hasUrgent = cluster.orders.some((o) => 
          o.deliveryNote && 
          o.status === 'pending' &&
          (o.deliveryNote.toLowerCase().includes('gấp') || 
           o.deliveryNote.toLowerCase().includes('hẹn') || 
           o.deliveryNote.toLowerCase().includes('trước') || 
           o.deliveryNote.toLowerCase().includes('giờ'))
        );

        const isAllDelivered = deliveredInCluster === totalInCluster && totalInCluster > 0;

        return (
          <div 
            key={cluster.name}
            className={`rounded-2xl border transition-all duration-300 shadow-md ${
              isAllDelivered
                ? 'bg-slate-900/40 border-slate-800/80'
                : hasUrgent
                ? 'bg-slate-900/95 border-amber-500/50 shadow-amber-500/5'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            {/* Header Cụm Tuyến Đường */}
            <div className="p-3.5 bg-slate-950/60 rounded-t-2xl border-b border-slate-800/80 flex items-center justify-between gap-2">
              <div 
                onClick={() => toggleCollapse(cluster.name)}
                className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                  isAllDelivered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : hasUrgent
                    ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}>
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm text-slate-100 truncate">
                      {cluster.name}
                    </h2>
                    {hasUrgent && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold shrink-0">
                        <Clock className="w-2.5 h-2.5" /> Giao Đầu / Hẹn Giờ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                    <span>
                      {deliveredInCluster}/{totalInCluster} đơn đã giao
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      COD: {formatVND(codInCluster)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút điều chỉnh thứ tự cụm & Thu gọn */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => onMoveCluster(index, -1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Xếp tuyến này lên trước"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  disabled={index === clusters.length - 1}
                  onClick={() => onMoveCluster(index, 1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Xếp tuyến này xuống sau"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => toggleCollapse(cluster.name)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Danh sách các đơn hàng trong cụm */}
            {!isCollapsed && (
              <div className="p-3 space-y-3">
                {cluster.orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onMarkDelivered={onMarkDelivered}
                    onOpenFailModal={onOpenFailModal}
                    onUndoStatus={onUndoStatus}
                    onEditOrder={onEditOrder}
                    onDeleteOrder={onDeleteOrder}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
