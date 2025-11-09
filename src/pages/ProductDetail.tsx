import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShoppingCart, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 5,
    minutes: 58,
    seconds: 49
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
            name_ar,
            name_en
          )
        `)
        .eq('id', id)
        .order('display_order', { foreignTable: 'product_images' })
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleBuyNow = () => {
    const message = `مرحباً، أريد شراء المنتج: ${product?.name_ar}`;
    window.open(`https://wa.me/201008512398?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success('تم إضافة المنتج للسلة');
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
      <div className="container max-w-2xl mx-auto px-4">
        <div className="relative">
          <img
            src={product.product_images?.[0]?.image_url || '/placeholder.svg'}
            alt={product.name_ar}
            className="w-full h-[400px] object-cover"
          />
        </div>

        <div className="py-4 space-y-4">
          <h1 className="text-2xl font-bold text-center">{product.name_ar}</h1>

          <div className="flex items-center justify-center gap-3">
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {product.price} ج.م
              </span>
            )}
            <span className="text-3xl font-bold text-[#E53935]">
              {hasDiscount ? product.discount_price : product.price} ج.م
            </span>
          </div>

          {hasDiscount && (
            <>
              <div className="flex items-center justify-center gap-2 text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>الوقت المتبقي للخصم</span>
              </div>

              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.days}</div>
                  <div className="text-xs text-muted-foreground">أيام</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.hours}</div>
                  <div className="text-xs text-muted-foreground">ساعات</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-xs text-muted-foreground">دقائق</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-xs text-muted-foreground">ثواني</div>
                </div>
              </div>

              <div className="relative max-w-md mx-auto">
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E53935] rounded-full transition-all duration-300"
                    style={{ width: '70%' }}
                  />
                </div>
                <p className="text-center text-sm text-[#E53935] font-semibold mt-2">
                  فقط متبقي 15 قطعة
                </p>
              </div>

              <p className="text-center text-sm">
                يشاهد هذا المنتج الآن <span className="font-bold bg-foreground text-background px-2 py-0.5 rounded">41</span> عميل
              </p>
            </>
          )}

          <div className="space-y-3">
            <Button 
              className="w-full bg-[#D4A024] hover:bg-[#C09020] text-white py-6 text-lg"
              onClick={handleBuyNow}
            >
              <Wallet className="ml-2 w-5 h-5" />
              اضغط هنا للشراء
            </Button>

            <Button 
              variant="outline"
              className="w-full border-[#D4A024] text-[#D4A024] hover:bg-[#D4A024]/10 py-6 text-lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="ml-2 w-5 h-5" />
              أضف للسلة
            </Button>

            <Button 
              className="w-full bg-[#D4A024] hover:bg-[#C09020] text-white py-6 text-lg"
              onClick={handleBuyNow}
            >
              <Wallet className="ml-2 w-5 h-5" />
              اضغط هنا للشراء
            </Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-center">
              <p className="font-bold text-lg">Kzamiza.com</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span dir="ltr">44455529 011</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
