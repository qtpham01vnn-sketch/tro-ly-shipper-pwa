-- BẢNG 1: LƯU TRỮ VẬN ĐƠN THEO CA
CREATE TABLE IF NOT EXISTS public.shipper_orders (
    id TEXT PRIMARY KEY,
    tracking_code TEXT,
    customer_name TEXT,
    phone TEXT,
    full_address TEXT,
    street_or_area TEXT,
    cod_amount NUMERIC DEFAULT 0,
    shipping_fee NUMERIC DEFAULT 4500,
    delivery_note TEXT,
    status TEXT DEFAULT 'pending',
    fail_reason TEXT,
    call_attempts INT DEFAULT 0,
    carrier TEXT DEFAULT 'J&T Express',
    shipper_name TEXT DEFAULT 'Shipper Pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BẢNG 2: LƯU TRỮ SỔ NHẬT KÝ VÀ ĐỐI SOÁT HÀNG NGÀY
CREATE TABLE IF NOT EXISTS public.shipper_daily_logs (
    id TEXT PRIMARY KEY,
    log_date DATE NOT NULL,
    shipper_name TEXT,
    carrier TEXT,
    total_orders INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    total_cod NUMERIC DEFAULT 0,
    shipping_wage NUMERIC DEFAULT 4500,
    total_wage_earned NUMERIC DEFAULT 0,
    base_salary NUMERIC DEFAULT 5000000,
    total_income NUMERIC DEFAULT 0,
    orders_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật quyền truy cập công khai an toàn (RLS Policies)
ALTER TABLE public.shipper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipper_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on shipper_orders" ON public.shipper_orders FOR ALL USING (true);
CREATE POLICY "Allow public all on shipper_daily_logs" ON public.shipper_daily_logs FOR ALL USING (true);
