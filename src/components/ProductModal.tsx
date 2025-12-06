import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Share2, Eye, Flame, Clock, ShoppingCart, Heart, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  timeLeft: { hours: number; minutes: number; seconds: number };
  viewersCount: number;
  progressPercentage: number;
  fakeStockLeft: number;
}

export const ProductModal = ({ 
  product, 
  isOpen, 
  onClose,
  timeLeft,
  viewersCount,
  progressPercentage,
  fakeStockLeft
}: ProductModalProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  
  const inWishlist = isInWishlist(product.id);
  
  // دعم العروض
  const isOffer = product.is_offer && product.offer_price && product.offer_price < product.price;
  const hasDiscount = (product.discount_price && product.discount_price < product.price) || isOffer;
  const finalPrice = isOffer ? product.offer_price : (product.discount_price || product.price);
  const originalPrice = product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const remainingStock = fakeStockLeft;

  // المقاسات والألوان من المنتج
  const sizeOptions = product.size_options || [];
  const colorOptions = product.color_options || [];
  const hasSizes = sizeOptions.length > 0;
  const hasColors = colorOptions.length > 0;

  const handleShare = () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(productUrl);
    toast.success("تم نسخ رابط المنتج!");
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (goToCart: boolean = false) => {
    // التحقق من اختيار المقاس واللون إذا كانت متاحة
    if (hasSizes && !selectedSize) {
      toast.error("⚠️ يرجى اختيار المقاس أولاً", { duration: 3000 });
      return;
    }
    if (hasColors && !selectedColor) {
      toast.error("⚠️ يرجى اختيار اللون أولاً", { duration: 3000 });
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    
    if (goToCart) {
      navigate('/cart');
      onClose();
    } else {
      toast.success(`✅ تم إضافة "${product.name_ar}" للسلة${selectedSize ? ` - مقاس: ${selectedSize}` : ''}${selectedColor ? ` - لون: ${selectedColor}` : ''}`);
    }
  };

  const productImages = product.product_images && product.product_images.length > 0 
    ? product.product_images 
    : product.image_url 
      ? [{ image_url: product.image_url }] 
      : [];
  
  const stockQuantity = product.stock ?? product.stock_quantity ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 z-50"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="grid md:grid-cols-2 gap-6 pt-8">
          {/* الصور */}
          <div className="relative">
            {hasDiscount && (
              <Badge className="absolute top-2 right-2 z-10 bg-gradient-to-r from-accent to-destructive border-0 text-sm px-3 py-1">
                {isOffer ? '🔥 عرض خاص' : 'خصم'} {discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-primary to-secondary border-0">
                مميز ⭐
              </Badge>
            )}
            
            {productImages.length > 1 ? (
              <Carousel className="w-full" opts={{ direction: "rtl" }}>
                <CarouselContent>
                  {productImages.map((img: any, index: number) => (
                    <CarouselItem key={index}>
                      <img
                        src={img.image_url || "/placeholder.svg"}
                        alt={`${product.name_ar || product.name} - صورة ${index + 1}`}
                        className="w-full h-96 object-cover rounded-lg"
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
                className="w-full h-96 object-cover rounded-lg"
              />
            )}
          </div>

          {/* التفاصيل */}
          <div className="space-y-4">
            <DialogHeader>
              <h2 className="text-2xl font-bold">{product.name_ar}</h2>
              <p className="text-muted-foreground">{product.name_en}</p>
            </DialogHeader>

            {/* العد التنازلي */}
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

            {/* عدد المشاهدين */}
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

            {/* التقييم */}
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews_count} تقييم)</span>
              </div>
            )}

            {/* السعر */}
            <div className="flex items-center gap-3 flex-wrap">
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through decoration-2">
                  {originalPrice} جنيه
                </span>
              )}
              <span className={`text-3xl font-bold ${hasDiscount ? 'text-destructive' : 'text-primary'}`}>
                {finalPrice} جنيه
              </span>
              {isOffer && (
                <Badge className="bg-destructive/20 text-destructive border-destructive">
                  وفّر {originalPrice - finalPrice} جنيه
                </Badge>
              )}
            </div>

            {/* اختيار المقاس */}
            {hasSizes && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1">
                  المقاس <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size: string) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={selectedSize === size ? "ring-2 ring-primary" : ""}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-destructive">يرجى اختيار المقاس</p>
                )}
              </div>
            )}

            {/* اختيار اللون */}
            {hasColors && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1">
                  اللون <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color: string) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                      className={selectedColor === color ? "ring-2 ring-primary" : ""}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
                {!selectedColor && (
                  <p className="text-xs text-destructive">يرجى اختيار اللون</p>
                )}
              </div>
            )}

            {/* الكمية */}
            {stockQuantity <= (product.low_stock_threshold || 5) && stockQuantity > 0 && (
              <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500">
                <Flame className="w-3 h-3 ml-1 animate-pulse" />
                الكمية محدودة - اسرع للشراء!
              </Badge>
            )}

            {/* الوصف */}
            {(product.description_ar || product.description) && (
              <div className="space-y-2">
                <h3 className="font-semibold">الوصف</h3>
                <p className="text-muted-foreground text-sm">
                  {product.description_ar || product.description}
                </p>
              </div>
            )}

            {/* الأزرار */}
            <div className="flex flex-col gap-2 pt-4">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all" 
                size="lg"
                onClick={() => handleAddToCart(true)}
                disabled={stockQuantity === 0}
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                {stockQuantity === 0 ? 'نفذت الكمية' : '🛒 اضغط للشراء'}
              </Button>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  size="lg"
                  variant="outline"
                  onClick={() => handleAddToCart(false)}
                  disabled={stockQuantity === 0}
                >
                  وضع في السلة
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};