import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Share2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            image_url,
            display_order
          ),
          categories (
            name
          )
        `)
        .eq('id', id)
        .order('display_order', { foreignTable: 'product_images' })
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name_ar || product?.name || 'منتج',
          text: product?.description_ar || product?.description || '',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast.success('تم نسخ رابط المنتج!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('تم نسخ رابط المنتج!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">المنتج غير موجود</h2>
        <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
      </div>
    );
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowRight className="ml-2" />
          العودة
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative">
            {hasDiscount && (
              <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-accent to-destructive border-0">
                خصم {discountPercentage}%
              </Badge>
            )}
            <img
              src={product.product_images?.[0]?.image_url || '/placeholder.svg'}
              alt={product.name_ar}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name_ar}</h1>
              <p className="text-lg text-muted-foreground">{product.name_en}</p>
            </div>

            {product.categories && (
              <Badge variant="outline">{product.categories.name}</Badge>
            )}

            {product.rating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews_count} تقييم)</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.price} جنيه
                </span>
              )}
              <span className="text-3xl font-bold text-primary">
                {hasDiscount ? product.discount_price : product.price} جنيه
              </span>
            </div>

            {product.description_ar && (
              <div>
                <h3 className="font-semibold mb-2">الوصف</h3>
                <p className="text-muted-foreground">{product.description_ar}</p>
              </div>
            )}

            {(product.stock || 0) > 0 ? (
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={() => addToCart(product, [], [])}
                >
                  أضف للسلة
                </Button>
                <Button size="lg" variant="outline" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Badge variant="destructive" className="text-lg py-2 px-4">
                نفذت الكمية
              </Badge>
            )}

            {(product.stock || 0) <= (product.low_stock_threshold || 5) && (product.stock || 0) > 0 && (
              <Badge variant="outline">
                الكمية محدودة! متبقي {product.stock} قطعة فقط
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
