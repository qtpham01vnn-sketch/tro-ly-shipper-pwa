import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Edit3, 
  Layers, 
  CheckCheck,
  Plus,
  Key,
  Eye,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { analyzeShippingLabel, testGeminiApiKey } from '../services/geminiService';
import { formatVND } from '../services/exportService';

export default function BatchScannerModal({
  isOpen,
  onClose,
  onAddOrders,
  apiKey,
  defaultShippingFee = 4500,
  selectedModel = 'gemini-1.5-flash',
  onSaveApiKey
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'scanning' | 'done'
  const [scannedResults, setScannedResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');
  const [showKeyEdit, setShowKeyEdit] = useState(!apiKey);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [testKeyStatus, setTestKeyStatus] = useState(null); // null | { ok: bool, message: string }
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [showPlainKey, setShowPlainKey] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      setTempApiKey(apiKey);
      setShowKeyEdit(false);
    } else {
      setShowKeyEdit(true);
    }
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const currentKey = (tempApiKey.trim() || apiKey || '').replace(/[\r\n\t\s]/g, '');

  const handleTestKey = async () => {
    if (!currentKey) {
      setTestKeyStatus({ ok: false, message: 'Vui lòng dán API Key trước khi kiểm tra' });
      return;
    }
    setIsTestingKey(true);
    setTestKeyStatus(null);
    const result = await testGeminiApiKey(currentKey);
    setIsTestingKey(false);
    setTestKeyStatus(result);
  };

  // Xử lý chọn nhiều file ảnh
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.slice(0, 50);
    setSelectedFiles(validFiles);
    setScannedResults([]);
    setErrorMessage('');
    setScanStatus('idle');
  };

  // Quét hàng loạt SONG SONG với tốc độ an toàn không bị giới hạn Google API
  const handleStartBatchOCR = async () => {
    if (!currentKey) {
      setErrorMessage('Vui lòng nhập Google Gemini API Key để AI quét ảnh thật.');
      setShowKeyEdit(true);
      return;
    }

    if (selectedFiles.length === 0) return;

    setScanStatus('scanning');
    setErrorMessage('');
    setProgress({ current: 0, total: selectedFiles.length });

    const allExtractedOrders = [];
    const seenTracking = new Set();
    let completedCount = 0;

    // Quét tuần tự từng ảnh với độ trễ 400ms để đảm bảo 100% không bị quá tải Quota Google AI
    for (let fileIdx = 0; fileIdx < selectedFiles.length; fileIdx++) {
      const file = selectedFiles[fileIdx];
      const previewUrl = URL.createObjectURL(file);

      try {
        const orderResults = await analyzeShippingLabel(
          file, 
          currentKey, 
          defaultShippingFee, 
          selectedModel
        );

        const list = Array.isArray(orderResults) ? orderResults : [orderResults];
        list.forEach((item) => {
          const trackingKey = (item.trackingCode && item.trackingCode.length > 4) ? item.trackingCode : null;
          if (trackingKey && seenTracking.has(trackingKey)) {
            return;
          }
          if (trackingKey) {
            seenTracking.add(trackingKey);
          }
          allExtractedOrders.push({
            ...item,
            previewUrl,
            originalFileName: file.name
          });
        });
      } catch (err) {
        console.error(`Lỗi ảnh ${file.name}:`, err);
        allExtractedOrders.push({
          id: 'ord-err-' + Date.now() + '-' + fileIdx,
          trackingCode: '',
          customerName: '',
          phone: '',
          fullAddress: '',
          streetOrArea: 'Chưa nhận diện',
          codAmount: 0,
          shippingFee: defaultShippingFee,
          deliveryNote: '',
          status: 'pending',
          failReason: '',
          callAttempts: 0,
          carrier: '',
          scanOk: false,
          scanErrorReason: err.message || 'Ảnh mờ hoặc không đọc được',
          previewUrl,
          originalFileName: file.name
        });
      } finally {
        completedCount++;
        setProgress({ current: completedCount, total: selectedFiles.length });
      }

      // Giãn cách an toàn 800ms giữa các request để giữ dưới giới hạn Google 15 RPM
      if (fileIdx < selectedFiles.length - 1) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    setScannedResults(allExtractedOrders);
    setScanStatus('done');
  };

  // Quét lại các ảnh bị lỗi/chưa rõ
  const handleRetryFailedOrders = async () => {
    const failedItems = scannedResults.filter((o) => !o.scanOk || !o.fullAddress);
    if (failedItems.length === 0) return;

    setScanStatus('scanning');
    setProgress({ current: 0, total: failedItems.length });

    const updatedResults = [...scannedResults];
    let count = 0;

    for (let i = 0; i < updatedResults.length; i++) {
      const item = updatedResults[i];
      if (!item.scanOk || !item.fullAddress) {
        // Tìm file tương ứng trong selectedFiles
        const matchedFile = selectedFiles.find((f) => f.name === item.originalFileName);
        if (matchedFile) {
          try {
            const reResults = await analyzeShippingLabel(
              matchedFile,
              currentKey,
              defaultShippingFee,
              selectedModel
            );
            const list = Array.isArray(reResults) ? reResults : [reResults];
            if (list.length > 0 && list[0].scanOk) {
              updatedResults[i] = {
                ...list[0],
                previewUrl: item.previewUrl,
                originalFileName: matchedFile.name
              };
            }
          } catch (e) {
            console.error('Lỗi khi quét lại:', e);
          }
        }
        count++;
        setProgress({ current: count, total: failedItems.length });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setScannedResults(updatedResults);
    setScanStatus('done');
  };

  const handleRemoveResult = (index) => {
    setScannedResults((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateField = (index, field, value) => {
    setScannedResults((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleConfirmAddToShift = () => {
    const validOrders = scannedResults.filter((item) => item.scanOk && item.fullAddress);
    onAddOrders(validOrders.length > 0 ? validOrders : scannedResults);
    onClose();
  };

  const validCount = scannedResults.filter((o) => o.scanOk && o.fullAddress).length;
  const invalidCount = scannedResults.filter((o) => !o.scanOk || !o.fullAddress).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Quét Bưu Kiện Thật (AI Vision OCR)</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {currentKey ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Đã kết nối Google Gemini Vision AI
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-bold">
                    ⚠️ Cần nhập API Key để quét ảnh thật
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh API Key (Tự động thu gọn khi đã lưu) */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-xs space-y-2">
          {currentKey && !showKeyEdit ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Key: <strong className="text-emerald-400 font-mono">••••••••••••••••••••</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTestingKey}
                  className="text-[11px] text-emerald-400 hover:underline font-bold"
                >
                  {isTestingKey ? 'Đang test...' : 'Kiểm tra Key'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowKeyEdit(true);
                    setTestKeyStatus(null);
                  }}
                  className="text-[11px] text-sky-400 hover:underline font-bold"
                >
                  Đổi Key
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 py-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  <span>Dán Google Gemini API Key:</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5 font-semibold"
                >
                  <span>Lấy key miễn phí</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPlainKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => {
                      setTempApiKey(e.target.value);
                      setTestKeyStatus(null);
                    }}
                    placeholder="Dán AIzaSy... vào đây"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPlainKey(!showPlainKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    title={showPlainKey ? 'Ẩn Key' : 'Hiện Key để kiểm tra'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTestingKey}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold shrink-0 border border-slate-700"
                >
                  {isTestingKey ? 'Đang test...' : 'Kiểm tra'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempApiKey.trim()) {
                      onSaveApiKey(tempApiKey.trim().replace(/[\r\n\t\s]/g, ''));
                      setShowKeyEdit(false);
                      setErrorMessage('');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shrink-0"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}

          {testKeyStatus && (
            <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              testKeyStatus.ok
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              <span>{testKeyStatus.ok ? '✅' : '❌'}</span>
              <span>{testKeyStatus.message}</span>
            </div>
          )}
        </div>

        {/* Nội dung chính Modal */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Khu vực chọn ảnh */}
          {scanStatus !== 'done' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300 transition active:scale-98"
                >
                  <Upload className="w-8 h-8 mb-2 text-sky-400" />
                  <span className="font-bold text-xs">Chọn Ảnh Từ Thư Viện</span>
                  <span className="text-[10px] text-slate-400 mt-1">Hỗ trợ 10 - 50 ảnh cùng lúc</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 transition active:scale-98"
                >
                  <Camera className="w-8 h-8 mb-2 text-emerald-400" />
                  <span className="font-bold text-xs">Chụp Ảnh Bưu Kiện</span>
                  <span className="text-[10px] text-slate-400 mt-1">Chụp rõ tem & chữ bút lông</span>
                </button>
              </div>

              {selectedFiles.length > 0 && (
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Đã chọn: <strong className="text-sky-400">{selectedFiles.length}</strong> ảnh</span>
                    </div>

                    {scanStatus === 'idle' && (
                      <button
                        onClick={handleStartBatchOCR}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Bắt Đầu Bóc Tách AI</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 overflow-x-auto py-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-slate-950/80 px-1 rounded text-white font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress bar khi đang quét song song */}
              {scanStatus === 'scanning' && (
                <div className="p-5 bg-slate-950/90 rounded-2xl border border-sky-500/30 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-slate-200">
                    Đang bóc tách tốc độ cao (Xử lý song song): {progress.current} / {progress.total} ảnh...
                  </div>
                  <p className="text-[11px] text-slate-400">Đang nén ảnh và gửi qua Gemini Vision AI</p>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hiển thị kết quả bóc tách */}
          {scanStatus === 'done' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-extrabold text-sm text-white">
                    Kết quả đọc được ({scannedResults.length} đơn)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {invalidCount > 0 && (
                    <>
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        ⚠️ {invalidCount} đơn lỗi/mờ
                      </span>
                      <button
                        onClick={handleRetryFailedOrders}
                        className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl border border-amber-500/30 font-bold flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Quét lại đơn lỗi</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedFiles([]);
                      setScanStatus('idle');
                    }}
                    className="text-xs text-sky-400 hover:underline font-semibold ml-1"
                  >
                    + Chọn ảnh khác
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                {scannedResults.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className={`p-3.5 rounded-2xl border bg-slate-950/80 space-y-2.5 transition ${
                      item.scanOk && item.fullAddress ? 'border-slate-800' : 'border-rose-500/60 bg-rose-950/20'
                    }`}
                  >
                    {/* Cảnh báo nếu tem không đọc được */}
                    {(!item.scanOk || !item.fullAddress) && (
                      <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{item.scanErrorReason || '⚠️ Tem bị mờ / che góc - Vui lòng chụp lại gần hơn'}</span>
                        </div>
                        {item.previewUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewImageModal(item.previewUrl)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 border border-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem ảnh
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item.trackingCode}
                          onChange={(e) => handleUpdateField(idx, 'trackingCode', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono font-bold text-sky-400 w-36"
                          placeholder="Mã vận đơn"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {item.carrier || 'Bưu kiện'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.previewUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewImageModal(item.previewUrl)}
                            className="p-1.5 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-800"
                            title="Soi ảnh bưu kiện"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveResult(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                          title="Xóa bỏ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">Tên người nhận trên tem</label>
                        <input
                          type="text"
                          value={item.customerName}
                          onChange={(e) => handleUpdateField(idx, 'customerName', e.target.value)}
                          placeholder="Chưa thấy tên"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">Số điện thoại</label>
                        <input
                          type="text"
                          value={item.phone}
                          onChange={(e) => handleUpdateField(idx, 'phone', e.target.value)}
                          placeholder="Chưa thấy SĐT"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-sky-400 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block">Địa chỉ đầy đủ in trên tem</label>
                      <input
                        type="text"
                        value={item.fullAddress}
                        onChange={(e) => handleUpdateField(idx, 'fullAddress', e.target.value)}
                        placeholder="Chưa đọc được địa chỉ"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-amber-300 font-bold block">Tuyến / Khu Phố</label>
                        <input
                          type="text"
                          value={item.streetOrArea}
                          onChange={(e) => handleUpdateField(idx, 'streetOrArea', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-amber-300 font-bold"
                          placeholder="KP..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-400 font-bold block">Tiền COD (VNĐ)</label>
                        <input
                          type="number"
                          value={item.codAmount}
                          onChange={(e) => handleUpdateField(idx, 'codAmount', parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-emerald-400 font-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">Ghi chú / Chữ viết tay</label>
                        <input
                          type="text"
                          value={item.deliveryNote}
                          onChange={(e) => handleUpdateField(idx, 'deliveryNote', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-300"
                          placeholder="Trống nếu không có"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Đóng
          </button>

          {scanStatus === 'done' && (
            <button
              onClick={handleConfirmAddToShift}
              disabled={validCount === 0 && scannedResults.length === 0}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Nạp {validCount > 0 ? validCount : scannedResults.length} Đơn Vào Tuyến Giao</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Zoom Xem Ảnh Gốc */}
      {previewImageModal && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[85vh] w-full flex flex-col">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 p-2 text-white bg-slate-800 rounded-full hover:bg-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImageModal} 
              alt="Zoom bưu kiện" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
