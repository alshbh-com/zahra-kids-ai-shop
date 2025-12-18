-- إضافة عمود لأسعار المقاسات الإضافية
ALTER TABLE public.product_color_variants 
ADD COLUMN IF NOT EXISTS size_prices jsonb DEFAULT '[]'::jsonb;

-- التعليق: size_prices هو مصفوفة من [{size: "XL", extra_price: 50}]