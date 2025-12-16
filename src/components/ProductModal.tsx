import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Share2, Eye, Flame, Clock, ShoppingCart, Heart, X, Plus, Minus } from "lucide-react";
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
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
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

  // إضافة/إزالة مقاس
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    } else if (selectedSizes.length < quantity) {
      setSelectedSizes(prev => [...prev, size]);
    } else {
      toast.error(`يمكنك اختيار ${quantity} مقاس/مقاسات فقط حسب عدد القطع`);
    }
  };

  // إضافة/إزالة لون
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(prev => prev.filter(c => c !== color));
    } else if (selectedColors.length < quantity) {
      setSelectedColors(prev => [...prev, color]);
    } else {
      toast.error(`يمكنك اختيار ${quantity} لون/ألوان فقط حسب عدد القطع`);
    }
  };

  // عند تغيير الكمية، تقليل المقاسات والألوان إذا لزم الأمر
  const handleQuantityChange = (newQty: number) => {
    const stockQuantity = product.stock ?? product.stock_quantity ?? 99;
    if (newQty < 1) return;
    if (newQty > stockQuantity) {
      toast.error(`الحد الأقصى المتاح هو ${stockQuantity} قطعة`);
      return;
    }
    setQuantity(newQty);
    // تقليل الاختيارات إذا تجاوزت الكمية الجديدة
    if (selectedSizes.length > newQty) {
      setSelectedSizes(prev => prev.slice(0, newQty));
    }
    if (selectedColors.length > newQty) {
      setSelectedColors(prev => prev.slice(0, newQty));
    }
  };

  const handleAddToCart = (goToCart: boolean = false) => {
    // التحقق من اختيار المقاس واللون إذا كانت متاحة
    if (hasSizes && selectedSizes.length === 0) {
      toast.error("⚠️ يرجى اختيار مقاس واحد على الأقل", { duration: 3000 });
      return;
    }
    if (hasColors && selectedColors.length === 0) {
      toast.error("⚠️ يرجى اختيار لون واحد على الأقل", { duration: 3000 });
      return;
    }

    // إضافة للسلة مع الكمية والمقاسات والألوان
    for (let i = 0; i < quantity; i++) {
      const size = selectedSizes[i] || selectedSizes[selectedSizes.length - 1] || undefined;
      const color = selectedColors[i] || selectedColors[selectedColors.length - 1] || undefined;
      addToCart(product, size ? [size] : [], color ? [color] : []);
    }
    
    if (goToCart) {
      navigate('/cart');
      onClose();
    } else {
      const sizesText = selectedSizes.length > 0 ? ` - مقاسات: ${selectedSizes.join(', ')}` : '';
      const colorsText = selectedColors.length > 0 ? ` - ألوان: ${selectedColors.join(', ')}` : '';
      toast.success(`✅ تم إضافة ${quantity} قطعة من "${product.name_ar}" للسلة${sizesText}${colorsText}`);
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

            {/* اختيار الكمية */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">الكمية</label>
              <div className="flex items-center gap-3 border rounded-lg p-2 w-fit">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={stockQuantity > 0 && quantity >= stockQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                يمكنك اختيار حتى {quantity} مقاس/مقاسات و {quantity} لون/ألوان
              </p>
            </div>

            {/* اختيار المقاس */}
            {hasSizes && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1">
                  المقاس <span className="text-destructive">*</span>
                  <Badge variant="secondary" className="text-xs mr-2">
                    {selectedSizes.length}/{quantity}
                  </Badge>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size: string) => {
                    const isSelected = selectedSizes.includes(size);
                    const count = selectedSizes.filter(s => s === size).length;
                    return (
                      <Button
                        key={size}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSize(size)}
                        className={`relative ${isSelected ? "ring-2 ring-primary" : ""}`}
                      >
                        {size}
                        {count > 1 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
                {selectedSizes.length === 0 && (
                  <p className="text-xs text-destructive">يرجى اختيار مقاس واحد على الأقل</p>
                )}
                {selectedSizes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedSizes.map((size, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        قطعة {idx + 1}: {size}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* اختيار اللون */}
            {hasColors && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1">
                  اللون <span className="text-destructive">*</span>
                  <Badge variant="secondary" className="text-xs mr-2">
                    {selectedColors.length}/{quantity}
                  </Badge>
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color: string) => {
                    const isSelected = selectedColors.includes(color);
                    const count = selectedColors.filter(c => c === color).length;
                    return (
                      <Button
                        key={color}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleColor(color)}
                        className={`relative ${isSelected ? "ring-2 ring-primary" : ""}`}
                      >
                        {color}
                        {count > 1 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
                {selectedColors.length === 0 && (
                  <p className="text-xs text-destructive">يرجى اختيار لون واحد على الأقل</p>
                )}
                {selectedColors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedColors.map((color, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        قطعة {idx + 1}: {color}
                      </Badge>
                    ))}
                  </div>
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
                {stockQuantity === 0 ? 'نفذت الكمية' : `🛒 اشتري ${quantity} قطعة - ${finalPrice * quantity} جنيه`}
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
