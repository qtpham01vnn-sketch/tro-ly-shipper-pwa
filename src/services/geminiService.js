/**
 * Dịch vụ Trích xuất Thông tin Vận đơn tiếng Việt sử dụng Google Gemini Vision AI
 * Chuẩn hóa, tự động thử model, nén ảnh và kiểm tra API Key
 */

export const CANDIDATE_MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-8b'
];

let cachedAvailableModels = null;
let workingModelCache = null;

/**
 * Lấy danh sách các model khả dụng từ chính Google API Key
 */
export async function getAvailableModels(apiKey) {
  if (!apiKey) return CANDIDATE_MODELS;
  const cleanKey = apiKey.replace(/[\r\n\t\s]/g, '');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    if (res.ok) {
      const data = await res.json();
      console.log('Google available models raw:', data.models);
      const valid = (data.models || [])
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''));
      if (valid.length > 0) {
        cachedAvailableModels = valid;
        return valid;
      }
    }
  } catch (e) {
    console.warn('Lỗi lấy danh sách models:', e);
  }
  return CANDIDATE_MODELS;
}

/**
 * Kiểm tra nhanh API Key có hoạt động hay không (Ping Test)
 */
export async function testGeminiApiKey(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    return { ok: false, message: 'Chưa nhập API Key' };
  }
  const cleanKey = apiKey.replace(/[\r\n\t\s]/g, '');
  
  try {
    const models = await getAvailableModels(cleanKey);
    const flashModels = [
      ...models.filter(m => m.includes('flash')),
      ...models.filter(m => !m.includes('flash'))
    ];

    let lastErr = '';
    for (const model of (flashModels.length > 0 ? flashModels : CANDIDATE_MODELS)) {
      const urls = [
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${cleanKey}`
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] })
          });

          if (res.ok) {
            workingModelCache = model;
            return {
              ok: true,
              message: `Kết nối thành công! Đang sử dụng model AI: ${model}`,
              model
            };
          } else {
            const err = await res.json().catch(() => ({}));
            lastErr = err?.error?.message || `Lỗi (${res.status})`;
            if (lastErr.includes('API_KEY_INVALID') || lastErr.includes('API key not valid')) {
              return { ok: false, message: 'API Key không hợp lệ hoặc đã bị vô hiệu hóa.' };
            }
          }
        } catch (e) {
          lastErr = e.message;
        }
      }
    }

    return { ok: false, message: lastErr || 'Không tìm thấy model AI khả dụng trên Key này.' };
  } catch (e) {
    return { ok: false, message: e.message || 'Lỗi mạng khi kiểm tra API Key' };
  }
}

/**
 * Nén và giảm kích thước ảnh trên trình duyệt
 */
export async function resizeImageFile(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Chuyển Blob/File thành Base64
 */
export async function fileToBase64(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: 'image/jpeg'
        }
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Chuẩn hóa gom cụm thông minh từ địa chỉ thực tế (Address Clustering Normalizer)
 */
export function extractStreetOrArea(fullAddress) {
  if (!fullAddress || fullAddress.trim() === '') return 'Chưa có địa chỉ';

  const raw = fullAddress.toLowerCase();

  if (raw.includes('trần quốc toản') || raw.includes('tran quoc toan')) {
    return 'Đường Trần Quốc Toản';
  }
  if (raw.includes('vũ hồng phô') || raw.includes('vũ hồng p') || raw.includes('vu hong pho')) {
    return 'Đường Vũ Hồng Phô';
  }
  if (raw.includes('phạm văn thuận') || raw.includes('pham van thuan')) {
    return 'Đường Phạm Văn Thuận';
  }
  if (raw.includes('bùi văn hòa') || raw.includes('bui van hoa')) {
    return 'Đường Bùi Văn Hòa';
  }
  if (raw.includes('đồng khởi') || raw.includes('dong khoi')) {
    return 'Đường Đồng Khởi';
  }
  if (raw.includes('hòa bình') || raw.includes('hoa binh') || raw.includes('an bình')) {
    return 'Phường An Bình';
  }

  if (raw.includes('kp4') || raw.includes('kp.4') || raw.includes('khu phố 4') || raw.includes('khu pho 4') || raw.includes('p4')) {
    return 'Khu Phố 4 (Bình Đa / Tam Hiệp)';
  }
  if (raw.includes('kp2') || raw.includes('kp.2') || raw.includes('khu phố 2') || raw.includes('khu pho 2') || raw.includes('tổ 13c') || raw.includes('tổ 15c')) {
    return 'Khu Phố 2 (Bình Đa)';
  }
  if (raw.includes('kp3') || raw.includes('kp.3') || raw.includes('khu phố 3') || raw.includes('khu pho 3')) {
    return 'Khu Phố 3';
  }
  if (raw.includes('kp1') || raw.includes('kp.1') || raw.includes('khu phố 1') || raw.includes('khu pho 1')) {
    return 'Khu Phố 1 (Bình Đa)';
  }

  if (raw.includes('bình đa') || raw.includes('binh da')) {
    return 'Phường Bình Đa';
  }
  if (raw.includes('tam hiệp') || raw.includes('tam hiep')) {
    return 'Phường Tam Hiệp';
  }
  if (raw.includes('tân hiệp') || raw.includes('tan hiep')) {
    return 'Phường Tân Hiệp';
  }

  const kpMatch = fullAddress.match(/(?:Khu\s*phố|KP|Kp|K\.P)\s*([0-9A-Za-z]+)/i);
  const streetMatch = fullAddress.match(/(?:Đường|Đ\.|Duong)\s*([0-9A-Z\u00C0-\u1EF9\s]+?)(?:,\s*|\s+(?:Khu|KP|Kp|Tổ|Phường|P\.|Xã|Quận|TP|Huyện))/i);

  if (streetMatch && streetMatch[1].trim().length > 2) {
    return `Đường ${streetMatch[1].trim()}`;
  }
  if (kpMatch) {
    return `Khu phố ${kpMatch[1].toUpperCase()}`;
  }

  const parts = fullAddress.split(',');
  return parts[0].trim() || fullAddress;
}

/**
 * Quét 1 ảnh bưu kiện bằng Gemini Vision AI
 */
export async function analyzeShippingLabel(file, apiKey, defaultShippingFee = 4500, userModel = '') {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chưa có API Key. Vui lòng kiểm tra và nhập lại API Key.');
  }

  const cleanKey = apiKey.replace(/[\r\n\t\s]/g, '');
  const compressedBlob = await resizeImageFile(file, 1280, 0.82);
  const imagePart = await fileToBase64(compressedBlob);

  const promptText = `
Bạn là hệ thống đọc phiếu vận đơn và tem bưu kiện tại Việt Nam (TikTok Shop, J&T Express, Shopee Express, GHN, GHTK, Viettel Post...).
Hãy quan sát kỹ hình ảnh và trích xuất TOÀN BỘ các tem bưu kiện có trong ảnh.

QUY TẮC BẮT BUỘC:
1. CHỈ TRÍCH XUẤT THÔNG TIN CÓ THẬT TRÊN HÌNH ẢNH.
2. TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT THÔNG TIN. Nếu không thấy tên/sđt/địa chỉ thì để chuỗi rỗng "".
3. Nếu trên ảnh có nhiều bưu kiện/gói hàng, trích xuất từng bưu kiện thành 1 phần tử trong danh sách labels.
4. Đọc cả chữ in trên phiếu và chữ viết tay bằng bút lông trên gói hàng (ví dụ số tiền COD viết tay như 300, 434, hoặc ghi chú hẹn giờ).
5. Nếu tem nào bị mờ, bị che khuất hoặc không đọc được số nhà/mã vận đơn: Đặt isReadable = false và ghi rõ lý do vào readableError.

Trả về duy nhất định dạng JSON chuẩn sau:
{
  "labels": [
    {
      "isReadable": true,
      "readableError": "",
      "trackingCode": "Mã vận đơn dưới mã vạch (VD: 862347993195, 802816071501...)",
      "customerName": "Tên người nhận",
      "phone": "Số điện thoại người nhận",
      "fullAddress": "Địa chỉ đầy đủ người nhận",
      "streetOrArea": "Tên Khu phố / Tổ / Đường / Địa điểm",
      "codAmount": 0,
      "deliveryNote": "Ghi chú in hoặc chữ viết tay trên bưu kiện",
      "carrier": "Hãng vận chuyển (TikTok Shop / J&T Express...)"
    }
  ]
}
`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          imagePart
        ]
      }
    ],
    generationConfig: {
      temperature: 0.0,
      responseMimeType: "application/json"
    }
  };

  // Lấy danh sách model khả dụng
  let modelsList = cachedAvailableModels;
  if (!modelsList || modelsList.length === 0) {
    modelsList = await getAvailableModels(cleanKey);
  }

  const prioritizedModels = [];
  if (workingModelCache) prioritizedModels.push(workingModelCache);
  if (userModel && !prioritizedModels.includes(userModel)) prioritizedModels.push(userModel);
  modelsList.forEach(m => {
    if (!prioritizedModels.includes(m)) prioritizedModels.push(m);
  });
  CANDIDATE_MODELS.forEach(m => {
    if (!prioritizedModels.includes(m)) prioritizedModels.push(m);
  });

  let lastError = null;
  let resData = null;

  for (const model of prioritizedModels) {
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${cleanKey}`
    ];

    let modelOk = false;
    for (const apiUrl of endpoints) {
      // Thử tối đa 2 lần nếu gặp 429
      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            resData = await response.json();
            workingModelCache = model;
            modelOk = true;
            break;
          } else {
            const errJson = await response.json().catch(() => ({}));
            const errMsg = errJson?.error?.message || `Lỗi ${response.status}`;

            if (response.status === 429) {
              lastError = new Error(`Google AI tạm thời đạt giới hạn 15 ảnh/phút (Lỗi 429). Vui lòng chờ 30 giây rồi quét tiếp.`);
              if (attempt < 2) {
                await new Promise((r) => setTimeout(r, 3000));
                continue;
              }
            } else {
              lastError = new Error(errMsg);
              break;
            }
          }
        } catch (e) {
          clearTimeout(timeoutId);
          if (e.name === 'AbortError') {
            lastError = new Error('Quá thời gian phản hồi (Timeout).');
          } else {
            lastError = e;
          }
          break;
        }
      }

      if (modelOk && resData) break;
    }

    if (modelOk && resData) break;
  }

  if (!resData) {
    throw lastError || new Error('Không thể kết nối tới Google Gemini API. Vui lòng kiểm tra lại Key.');
  }

  const candidateText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('AI không phản hồi nội dung từ ảnh.');
  }

  let cleanJson = candidateText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
  }

  const parsed = JSON.parse(cleanJson);
  const labelList = Array.isArray(parsed.labels) ? parsed.labels : (parsed.trackingCode || parsed.fullAddress ? [parsed] : []);

  if (labelList.length === 0) {
    return [{
      id: 'ord-err-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      trackingCode: '',
      customerName: '',
      phone: '',
      fullAddress: '',
      streetOrArea: 'Cần chụp lại',
      codAmount: 0,
      shippingFee: defaultShippingFee,
      deliveryNote: '',
      status: 'pending',
      failReason: '',
      callAttempts: 0,
      carrier: '',
      scanOk: false,
      scanErrorReason: 'Không tìm thấy tem vận đơn rõ ràng trên ảnh này. Vui lòng chụp lại gần và rõ hơn.'
    }];
  }

  return labelList.map((label, index) => {
    const isReadable = label.isReadable !== false && Boolean((label.trackingCode && label.trackingCode.trim()) || (label.fullAddress && label.fullAddress.trim()));
    const fullAddr = (label.fullAddress || '').trim();
    const area = extractStreetOrArea(fullAddr);

    let cod = 0;
    if (typeof label.codAmount === 'number') {
      cod = label.codAmount;
    } else if (label.codAmount) {
      const cleanedCod = String(label.codAmount).replace(/[^\d]/g, '');
      cod = parseInt(cleanedCod, 10) || 0;
    }

    return {
      id: 'ord-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substring(2, 6),
      trackingCode: (label.trackingCode || '').trim(),
      customerName: (label.customerName || '').trim(),
      phone: (label.phone || '').trim(),
      fullAddress: fullAddr,
      streetOrArea: area,
      codAmount: cod,
      shippingFee: defaultShippingFee,
      deliveryNote: (label.deliveryNote || '').trim(),
      status: 'pending',
      failReason: '',
      callAttempts: 0,
      carrier: (label.carrier || 'Bưu kiện').trim(),
      scanOk: isReadable,
      scanErrorReason: label.readableError || (!isReadable ? 'Tem bị mờ hoặc bị che khuất không đọc được' : '')
    };
  });
}
