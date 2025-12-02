import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Share2, Eye, Flame, Clock, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductModal } from "./ProductModal";

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  // أعداد وهمية للمشاهدين (عشوائية بين 300-800)
  const [viewersCount] = useState(Math.floor(Math.random() * (800 - 300 + 1)) + 300);
  
  // عد تنازلي مزيف يبدأ من وقت عشوائي
  const initialHours = Math.floor(Math.random() * (23 - 2 + 1)) + 2;
  const [timeLeft, setTimeLeft] = useState({
    hours: initialHours,
    minutes: Math.floor(Math.random() * 60),
    seconds: Math.floor(Math.random() * 60)
  });
  const [isWaiting, setIsWaiting] = useState(false);

  // حساب النسبة المئوية للتقدم - من 100% إلى 0%
  const totalSeconds = (initialHours * 60 * 60) + (timeLeft.minutes * 60) + timeLeft.seconds;
  const initialTotalSeconds = (initialHours * 60 * 60);
  const progressPercentage = Math.max(0, (totalSeconds / initialTotalSeconds) * 100);
  
  // عداد fake للكمية المتبقية (يقل مع الوقت)
  const [fakeStockLeft, setFakeStockLeft] = useState(Math.floor(Math.random() * (50 - 10 + 1)) + 10);

  useEffect(() => {
    if (isWaiting) {
      // انتظر دقيقة واحدة ثم ابدأ من جديد
      const newHours = Math.floor(Math.random() * (23 - 2 + 1)) + 2;
      const waitTimer = setTimeout(() => {
        setTimeLeft({
          hours: newHours,
          minutes: Math.floor(Math.random() * 60),
          seconds: Math.floor(Math.random() * 60)
        });
        setFakeStockLeft(Math.floor(Math.random() * (50 - 10 + 1)) + 10);
        setIsWaiting(false);
      }, 60000); // دقيقة واحدة

      return () => clearTimeout(waitTimer);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          // كل 10 ثواني، قلل الكمية المتبقية بشكل عشوائي
          if (prev.seconds % 10 === 0 && fakeStockLeft > 5) {
            setFakeStockLeft(current => Math.max(5, current - Math.floor(Math.random() * 3 + 1)));
          }
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // وصل للصفر - ابدأ فترة الانتظار
          setIsWaiting(true);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWaiting, fakeStockLeft]);

  // قطع متبقية أقل من المشاهدين
  const remainingStock = Math.max(1, Math.floor(viewersCount * 0.3));

  const handleShare = () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(productUrl);
    toast.success("تم نسخ رابط المنتج!");
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // دعم الصور من product_images أو image_url
  const productImages = product.product_images && product.product_images.length > 0 
    ? product.product_images 
    : product.image_url 
      ? [{ image_url: product.image_url }] 
      : [];
  const hasMultipleImages = productImages.length > 1;
  
  // دعم الكمية من stock أو stock_quantity (نبدأ بـ stock أولاً)
  const stockQuantity = product.stock ?? product.stock_quantity ?? 0;

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 cursor-pointer" onClick={handleCardClick}>
      <div className="relative overflow-hidden">
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 z-10 bg-gradient-to-r from-accent to-destructive border-0">
            خصم {discountPercentage}%
          </Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-primary to-secondary border-0">
            مميز ⭐
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-2 left-2 z-10 bg-background/80 hover:bg-background"
          onClick={handleWishlistToggle}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </Button>
        
        {hasMultipleImages ? (
          <Carousel className="w-full" opts={{ direction: "rtl" }}>
            <CarouselContent>
              {productImages.map((img: any, index: number) => (
                <CarouselItem key={index}>
                  <img
                    src={img.image_url || "/placeholder.svg"}
                    alt={`${product.name_ar || product.name} - صورة ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 right-auto" />
            <CarouselNext className="right-2 left-auto" />
          </Carousel>
        ) : (
          <img
            src={productImages[0]?.image_url || "/placeholder.svg"}
            alt={product.name_ar || product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{product.name_ar}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{product.name_en}</p>
        </div>

        {/* العد التنازلي مع Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm bg-destructive/10 text-destructive px-3 py-2 rounded-md">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-bold">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-xs">ينتهي العرض</span>
          </div>
          {/* Progress Bar مع النسبة */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">العرض ينتهي قريباً!</span>
              <span className="font-bold text-destructive">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-destructive/20">
              <div 
                className="h-full bg-gradient-to-r from-destructive via-orange-500 to-destructive transition-all duration-1000 ease-linear animate-pulse"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* عدد المشاهدين والقطع المتبقية */}
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">{viewersCount}</span>
            <span className="text-muted-foreground">يشاهدون الآن</span>
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-xs bg-orange-50 dark:bg-orange-950/20 text-orange-600 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-900">
            <Flame className="w-3 h-3 animate-pulse" />
            <span className="font-bold">متبقي {fakeStockLeft} قطعة فقط - اطلب الآن!</span>
          </div>
        </div>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price} جنيه
            </span>
          )}
          <span className="text-xl font-bold text-primary">
            {hasDiscount ? product.discount_price : product.price} جنيه
          </span>
        </div>

        {stockQuantity <= (product.low_stock_threshold || 5) && stockQuantity > 0 && (
          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500">
            <Flame className="w-3 h-3 ml-1 animate-pulse" />
            الكمية محدودة - اسرع للشراء!
          </Badge>
        )}

        <div className="flex flex-col gap-2">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-accent" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              navigate('/cart');
            }}
            disabled={stockQuantity === 0}
          >
            <ShoppingCart className="w-4 h-4 ml-2" />
            {stockQuantity === 0 ? 'نفذت الكمية' : 'اضغط للشراء'}
          </Button>
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              disabled={stockQuantity === 0}
            >
              وضع في السلة
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <ProductModal 
      product={product}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      timeLeft={timeLeft}
      viewersCount={viewersCount}
      progressPercentage={progressPercentage}
      fakeStockLeft={fakeStockLeft}
    />
    </>
  );
};
