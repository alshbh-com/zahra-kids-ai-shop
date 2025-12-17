-- Create product_color_variants table to manage sizes and stock per color
CREATE TABLE public.product_color_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  color TEXT NOT NULL,
  sizes TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, color)
);

-- Enable RLS
ALTER TABLE public.product_color_variants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all on product_color_variants" 
ON public.product_color_variants 
FOR ALL 
USING (true);

CREATE POLICY "Allow public read product_color_variants" 
ON public.product_color_variants 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_product_color_variants_updated_at
BEFORE UPDATE ON public.product_color_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();