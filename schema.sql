-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    product TEXT NOT NULL,
    qty INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    progress INTEGER NOT NULL DEFAULT 0,
    order_date DATE NOT NULL,
    due_date DATE NOT NULL,
    material TEXT NOT NULL,
    wire_gauge TEXT NOT NULL,
    stages JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to orders" ON public.orders
    FOR ALL TO authenticated USING (true);

-- 2. Create Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    material TEXT NOT NULL,
    qty_kg NUMERIC NOT NULL,
    unit_price_kg NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    order_date DATE NOT NULL,
    due_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Purchase Orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to POs" ON public.purchase_orders
    FOR ALL TO authenticated USING (true);

-- 3. Create RFQs Table
CREATE TABLE IF NOT EXISTS public.rfqs (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL DEFAULT 'Direct',
    source_ref TEXT,
    customer TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    quoted_amount NUMERIC,
    status TEXT NOT NULL DEFAULT 'received',
    received_date DATE NOT NULL,
    deadline DATE,
    quoted_date DATE,
    notes TEXT,
    converted_order_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to rfqs" ON public.rfqs
    FOR ALL TO authenticated USING (true);

-- 4. Create Material Price History Table
CREATE TABLE IF NOT EXISTS public.material_price_history (
    id TEXT PRIMARY KEY,
    material TEXT NOT NULL,
    wire_gauge TEXT,
    price_per_kg NUMERIC NOT NULL,
    supplier TEXT,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.material_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to price history" ON public.material_price_history
    FOR ALL TO authenticated USING (true);

-- 5. Add source tracking columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source_ref TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rfq_id TEXT;

-- 6. Create QC Reports Table
CREATE TABLE IF NOT EXISTS public.qc_reports (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    inspector TEXT NOT NULL,
    inspected_qty INTEGER NOT NULL,
    passed_qty INTEGER NOT NULL,
    rejected_qty INTEGER NOT NULL,
    defect_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.qc_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to qc reports" ON public.qc_reports
    FOR ALL TO authenticated USING (true);
