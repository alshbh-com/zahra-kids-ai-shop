import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Share2, Eye, Flame, Clock, ShoppingCart, Heart, X, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useColorVariants, ColorVariant } from "@/hooks/useColorVariants";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  timeLeft: { hours: number; minutes: number; seconds: number };
  viewersCount: number;
  progressPercentage: number;
  fakeStockLeft: number;
}

interface ColorSelection {
  color: string;
  quantity: number;
  sizes: { size: string; quantity: number }[];
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
  const [colorSelections, setColorSelections] = useState<ColorSelection[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const inWishlist = isInWishlist(product.id);
  
  // جلب الألوان والمقاسات من قاعدة البيانات
  const { data: colorVariants = [], isLoading: variantsLoading } = useColorVariants(product.id);
  
  // fallback للألوان والمقاسات القديمة إذا لم تكن هناك variants
  const legacySizeOptions = product.size_options || [];
  const legacyColorOptions = product.color_options || [];
  const hasVariants = colorVariants.length > 0;
  const hasSizes = hasVariants || legacySizeOptions.length > 0;
  const hasColors = hasVariants || legacyColorOptions.length > 0;
  
  // دعم العروض
  const isOffer = product.is_offer && product.offer_price && product.offer_price < product.price;
  const hasDiscount = (product.discount_price && product.discount_price < product.price) || isOffer;
  const finalPrice = isOffer ? product.offer_price : (product.discount_price || product.price);
  const originalPrice = product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setColorSelections([]);
      setSelectedColor(null);
    }
  }, [isOpen, product.id]);

  // حساب الكمية المتاحة للون
  const getColorStock = (color: string) => {
    if (hasVariants) {
      const variant = colorVariants.find(v => v.color === color);
      return variant?.stock || 0;
    }
    return product.stock ?? product.stock_quantity ?? 99;
  };

  // حساب المقاسات المتاحة للون
  const getColorSizes = (color: string) => {
    if (hasVariants) {
      const variant = colorVariants.find(v => v.color === color);
      return variant?.sizes || [];
    }
    return legacySizeOptions;
  };

  // حساب إجمالي القطع المختارة
  const getTotalSelectedQuantity = () => {
    return colorSelections.reduce((sum, sel) => sum + sel.quantity, 0);
  };

  // حساب إجمالي المقاسات المختارة للون
  const getColorSizesQuantity = (color: string) => {
    const selection = colorSelections.find(s => s.color === color);
    if (!selection) return 0;
    return selection.sizes.reduce((sum, s) => sum + s.quantity, 0);
  };

  // إضافة كمية للون
  const increaseColorQuantity = (color: string) => {
    const colorStock = getColorStock(color);
    const currentSelection = colorSelections.find(s => s.color === color);
    const currentQty = currentSelection?.quantity || 0;
    
    if (currentQty >= colorStock) {
      toast.error(`الكمية المتاحة من اللون "${color}" هي ${colorStock} فقط`);
      return;
    }
    
    if (getTotalSelectedQuantity() >= quantity) {
      toast.error(`لقد وصلت للحد الأقصى ${quantity} قطعة`);
      return;
    }

    setColorSelections(prev => {
      const existing = prev.find(s => s.color === color);
      if (existing) {
        return prev.map(s => s.color === color ? { ...s, quantity: s.quantity + 1 } : s);
      }
      return [...prev, { color, quantity: 1, sizes: [] }];
    });
  };

  // تقليل كمية اللون
  const decreaseColorQuantity = (color: string) => {
    setColorSelections(prev => {
      const existing = prev.find(s => s.color === color);
      if (!existing || existing.quantity <= 0) return prev;
      if (existing.quantity === 1) {
        return prev.filter(s => s.color !== color);
      }
      // تقليل المقاسات أيضاً إذا لزم الأمر
      const newQty = existing.quantity - 1;
      const totalSizes = existing.sizes.reduce((sum, s) => sum + s.quantity, 0);
      let newSizes = [...existing.sizes];
      if (totalSizes > newQty) {
        // نحتاج لتقليل المقاسات
        let toRemove = totalSizes - newQty;
        newSizes = newSizes.map(s => {
          if (toRemove > 0 && s.quantity > 0) {
            const remove = Math.min(toRemove, s.quantity);
            toRemove -= remove;
            return { ...s, quantity: s.quantity - remove };
          }
          return s;
        }).filter(s => s.quantity > 0);
      }
      return prev.map(s => s.color === color ? { ...s, quantity: newQty, sizes: newSizes } : s);
    });
  };

  // إضافة كمية للمقاس
  const increaseSizeQuantity = (color: string, size: string) => {
    const colorSelection = colorSelections.find(s => s.color === color);
    if (!colorSelection) {
      toast.error("يرجى اختيار اللون أولاً");
      return;
    }

    const totalSizes = getColorSizesQuantity(color);
    if (totalSizes >= colorSelection.quantity) {
      toast.error(`يمكنك اختيار ${colorSelection.quantity} مقاس/مقاسات فقط لهذا اللون`);
      return;
    }

    setColorSelections(prev => prev.map(s => {
      if (s.color === color) {
        const existingSize = s.sizes.find(sz => sz.size === size);
        if (existingSize) {
          return {
            ...s,
            sizes: s.sizes.map(sz => sz.size === size ? { ...sz, quantity: sz.quantity + 1 } : sz)
          };
        }
        return { ...s, sizes: [...s.sizes, { size, quantity: 1 }] };
      }
      return s;
    }));
  };

  // تقليل كمية المقاس
  const decreaseSizeQuantity = (color: string, size: string) => {
    setColorSelections(prev => prev.map(s => {
      if (s.color === color) {
        const existingSize = s.sizes.find(sz => sz.size === size);
        if (!existingSize || existingSize.quantity <= 0) return s;
        if (existingSize.quantity === 1) {
          return { ...s, sizes: s.sizes.filter(sz => sz.size !== size) };
        }
        return {
          ...s,
          sizes: s.sizes.map(sz => sz.size === size ? { ...sz, quantity: sz.quantity - 1 } : sz)
        };
      }
      return s;
    }));
  };

  // تغيير الكمية الإجمالية
  const handleQuantityChange = (newQty: number) => {
    const maxStock = hasVariants 
      ? colorVariants.reduce((sum, v) => sum + v.stock, 0)
      : (product.stock ?? product.stock_quantity ?? 99);
    
    if (newQty < 1) return;
    if (newQty > maxStock) {
      toast.error(`الحد الأقصى المتاح هو ${maxStock} قطعة`);
      return;
    }
    setQuantity(newQty);
    // تقليل الاختيارات إذا تجاوزت الكمية الجديدة
    if (getTotalSelectedQuantity() > newQty) {
      setColorSelections([]);
    }
  };

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
    const availableColors = hasVariants ? colorVariants.map(v => v.color) : legacyColorOptions;
    const requiresColor = availableColors.length > 0;
    const requiresSize = hasSizes;

    if (requiresColor && colorSelections.length === 0) {
      toast.error("⚠️ يرجى اختيار لون واحد على الأقل", { duration: 3000 });
      return;
    }

    const totalSelected = getTotalSelectedQuantity();
    if (requiresColor && totalSelected !== quantity) {
      toast.error(`⚠️ يرجى اختيار ${quantity} قطعة من الألوان`, { duration: 3000 });
      return;
    }

    // التحقق من المقاسات لكل لون
    if (requiresSize) {
      for (const selection of colorSelections) {
        const sizes = getColorSizes(selection.color);
        if (sizes.length > 0) {
          const totalSizesForColor = getColorSizesQuantity(selection.color);
          if (totalSizesForColor !== selection.quantity) {
            toast.error(`⚠️ يرجى اختيار ${selection.quantity} مقاس للون "${selection.color}"`, { duration: 3000 });
            return;
          }
        }
      }
    }

    // إضافة للسلة
    const allSizes: string[] = [];
    const allColors: string[] = [];

    for (const selection of colorSelections) {
      if (selection.sizes.length > 0) {
        for (const sizeSelection of selection.sizes) {
          for (let i = 0; i < sizeSelection.quantity; i++) {
            allColors.push(selection.color);
            allSizes.push(sizeSelection.size);
          }
        }
      } else {
        for (let i = 0; i < selection.quantity; i++) {
          allColors.push(selection.color);
        }
      }
    }

    // إذا لم تكن هناك ألوان variants، استخدم الطريقة القديمة
    if (!requiresColor) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product, [], []);
      }
    } else {
      addToCart(product, allSizes, allColors);
    }
    
    if (goToCart) {
      navigate('/cart');
      onClose();
    } else {
      toast.success(`✅ تم إضافة ${quantity} قطعة من "${product.name_ar}" للسلة`);
    }
  };

  const productImages = product.product_images && product.product_images.length > 0 
    ? product.product_images 
    : product.image_url 
      ? [{ image_url: product.image_url }] 
      : [];
  
  const stockQuantity = hasVariants 
    ? colorVariants.reduce((sum, v) => sum + v.stock, 0)
    : (product.stock ?? product.stock_quantity ?? 0);

  const availableColors = hasVariants ? colorVariants : legacyColorOptions.map((c: string) => ({ color: c, sizes: legacySizeOptions, stock: 99 }));

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
              <label className="text-sm font-semibold">الكمية المطلوبة</label>
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
            </div>

            {/* اختيار الألوان مع +/- */}
            {availableColors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  اختر اللون والكمية <span className="text-destructive">*</span>
                  <Badge variant="secondary" className="text-xs">
                    {getTotalSelectedQuantity()}/{quantity}
                  </Badge>
                </label>
                <div className="space-y-2">
                  {availableColors.map((variant: any) => {
                    const color = variant.color;
                    const colorStock = hasVariants ? variant.stock : 99;
                    const selection = colorSelections.find(s => s.color === color);
                    const selectedQty = selection?.quantity || 0;
                    const isOutOfStock = colorStock === 0;

                    return (
                      <div key={color} className={`border rounded-lg p-3 ${isOutOfStock ? 'opacity-50' : ''} ${selectedQty > 0 ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{color}</span>
                            <Badge variant="outline" className={`text-xs ${colorStock <= 5 ? 'border-orange-500 text-orange-500' : ''}`}>
                              متوفر: {colorStock}
                            </Badge>
                          </div>
                          {!isOutOfStock && (
                            <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => decreaseColorQuantity(color)}
                                disabled={selectedQty === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-bold">{selectedQty}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => increaseColorQuantity(color)}
                                disabled={selectedQty >= colorStock || getTotalSelectedQuantity() >= quantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {isOutOfStock && <Badge variant="destructive" className="text-xs">نفذ</Badge>}
                        </div>

                        {/* المقاسات للون المحدد */}
                        {selectedQty > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <label className="text-xs font-semibold flex items-center gap-1 mb-2">
                              اختر المقاسات <span className="text-destructive">*</span>
                              <Badge variant="secondary" className="text-xs mr-1">
                                {getColorSizesQuantity(color)}/{selectedQty}
                              </Badge>
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {(hasVariants ? variant.sizes : legacySizeOptions).map((size: string) => {
                                const sizeQty = selection?.sizes.find(s => s.size === size)?.quantity || 0;
                                return (
                                  <div key={size} className={`flex items-center gap-1 border rounded-md px-2 py-1 ${sizeQty > 0 ? 'border-primary bg-primary/10' : ''}`}>
                                    <span className="text-sm">{size}</span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5"
                                        onClick={() => decreaseSizeQuantity(color, size)}
                                        disabled={sizeQty === 0}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-4 text-center text-sm font-bold">{sizeQty}</span>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5"
                                        onClick={() => increaseSizeQuantity(color, size)}
                                        disabled={getColorSizesQuantity(color) >= selectedQty}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {getColorSizesQuantity(color) < selectedQty && (
                              <p className="text-xs text-destructive mt-1 animate-pulse">
                                ⚠️ يرجى اختيار {selectedQty - getColorSizesQuantity(color)} مقاس آخر
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {getTotalSelectedQuantity() < quantity && (
                  <p className="text-xs text-destructive animate-pulse">
                    ⚠️ يرجى اختيار {quantity - getTotalSelectedQuantity()} قطعة أخرى
                  </p>
                )}
              </div>
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
