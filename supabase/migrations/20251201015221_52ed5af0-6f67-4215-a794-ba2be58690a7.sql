-- تعديل جدول products لإضافة الأعمدة المطلوبة
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS discount_price NUMERIC,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- نقل البيانات من name إلى name_ar
UPDATE products SET name_ar = name WHERE name_ar IS NULL;

-- إنشاء جدول product_images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS على product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read product_images" 
ON product_images 
FOR SELECT 
USING (true);

CREATE POLICY "Allow all on product_images" 
ON product_images 
FOR ALL 
USING (true);

-- إنشاء جدول offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  discount_percentage INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS على offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read offers" 
ON offers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow all on offers" 
ON offers 
FOR ALL 
USING (true);

-- إنشاء trigger لتحديث updated_at في offers
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_offers_updated_at_trigger
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION update_offers_updated_at();