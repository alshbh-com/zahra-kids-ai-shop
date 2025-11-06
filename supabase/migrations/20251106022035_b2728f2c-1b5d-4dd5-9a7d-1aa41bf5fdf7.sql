-- إضافة سياسات RLS للسماح بإدارة المنتجات والعروض

-- سياسات المنتجات
CREATE POLICY "Allow insert products"
ON public.products
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update products"
ON public.products
FOR UPDATE
USING (true);

CREATE POLICY "Allow delete products"
ON public.products
FOR DELETE
USING (true);

-- سياسات صور المنتجات
CREATE POLICY "Allow insert product_images"
ON public.product_images
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update product_images"
ON public.product_images
FOR UPDATE
USING (true);

CREATE POLICY "Allow delete product_images"
ON public.product_images
FOR DELETE
USING (true);

-- سياسات العروض
CREATE POLICY "Allow insert offers"
ON public.offers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update offers"
ON public.offers
FOR UPDATE
USING (true);

CREATE POLICY "Allow delete offers"
ON public.offers
FOR DELETE
USING (true);

-- سياسات الفئات
CREATE POLICY "Allow insert categories"
ON public.categories
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update categories"
ON public.categories
FOR UPDATE
USING (true);

CREATE POLICY "Allow delete categories"
ON public.categories
FOR DELETE
USING (true);

-- سياسات الإعدادات
CREATE POLICY "Allow insert site_settings"
ON public.site_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update site_settings"
ON public.site_settings
FOR UPDATE
USING (true);

CREATE POLICY "Allow delete site_settings"
ON public.site_settings
FOR DELETE
USING (true);

-- سياسات الطلبات للقراءة
CREATE POLICY "Allow read orders"
ON public.orders
FOR SELECT
USING (true);