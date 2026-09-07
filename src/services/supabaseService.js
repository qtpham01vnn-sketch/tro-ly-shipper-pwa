/**
 * Dịch vụ Đồng bộ Dữ liệu Đơn Hàng & Nhật Ký lên Supabase Cloud Database
 */
import { createClient } from '@supabase/supabase-js';

const STORAGE_SUPABASE_CONFIG = 'shipper_supabase_config_v1';

export function getSupabaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_SUPABASE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    supabaseUrl: '',
    supabaseAnonKey: ''
  };
}

export function saveSupabaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_SUPABASE_CONFIG, JSON.stringify(config));
  } catch (e) {}
}

let supabaseClient = null;

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }
  return supabaseClient;
}

/**
 * Đồng bộ danh sách đơn hàng lên bảng `shipper_orders` trên Supabase
 */
export async function syncOrdersToSupabase(orders = [], shipperName = 'Shipper Pro') {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, message: 'Chưa cấu hình Supabase URL & Key' };

  try {
    // Lưu / Upsert đơn hàng
    const payload = orders.map((o) => ({
      id: o.id,
      tracking_code: o.trackingCode,
      customer_name: o.customerName,
      phone: o.phone,
      full_address: o.fullAddress,
      street_or_area: o.streetOrArea,
      cod_amount: o.codAmount || 0,
      shipping_fee: o.shippingFee || 4500,
      delivery_note: o.deliveryNote || '',
      status: o.status || 'pending',
      fail_reason: o.failReason || '',
      call_attempts: o.callAttempts || 0,
      carrier: o.carrier || 'J&T Express',
      shipper_name: shipperName,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('shipper_orders').upsert(payload);
    if (error) throw error;
    return { ok: true, message: `Đã đồng bộ ${orders.length} đơn lên Supabase Cloud!` };
  } catch (err) {
    console.error('Lỗi Supabase sync orders:', err);
    return { ok: false, message: err.message };
  }
}

/**
 * Đồng bộ nhật ký ngày lên bảng `shipper_daily_logs` trên Supabase
 */
export async function syncDailyLogToSupabase(logEntry) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, message: 'Chưa cấu hình Supabase' };

  try {
    const payload = {
      id: logEntry.id || ('log-' + logEntry.date),
      log_date: logEntry.date,
      shipper_name: logEntry.shipperName,
      carrier: logEntry.carrier,
      total_orders: logEntry.totalOrders || 0,
      delivered_count: logEntry.deliveredCount || 0,
      failed_count: logEntry.failedCount || 0,
      total_cod: logEntry.totalCOD || 0,
      shipping_wage: logEntry.shippingWage || 4500,
      total_wage_earned: logEntry.totalWageEarned || 0,
      base_salary: logEntry.baseSalary || 5000000,
      total_income: logEntry.totalIncome || 0,
      orders_json: JSON.stringify(logEntry.orders || []),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('shipper_daily_logs').upsert(payload);
    if (error) throw error;
    return { ok: true, message: 'Đã lưu sổ nhật ký lên Supabase Cloud!' };
  } catch (err) {
    console.error('Lỗi Supabase sync log:', err);
    return { ok: false, message: err.message };
  }
}
