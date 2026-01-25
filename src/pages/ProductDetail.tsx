import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Share2, Plus, Minus, ShoppingCart, Heart, Clock, Eye, Flame } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useColorVariants } from '@/hooks/useColorVariants';

interface ColorSelection {
  color: string;
  quantity: number;
  sizes: { size: string; quantity: number }[];
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [colorSelections, setColorSelections] = useState<ColorSelection[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 30, seconds: 0 });
  const [viewersCount] = useState(() => Math.floor(Math.random() * 500) + 300);
  const [fakeStockLeft] = useState(() => Math.floor(Math.random() * 20) + 5);

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

  const { data: colorVariants = [] } = useColorVariants(id || '');

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 5, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercentage = ((timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds) / (6 * 3600)) * 100;

  // Color variants logic
  const legacySizeOptions = product?.size_options || [];
  const legacyColorOptions = product?.color_options || [];
  const hasVariants = colorVariants.length > 0;
  const hasSizes = hasVariants || legacySizeOptions.length > 0;
  const hasColors = hasVariants || legacyColorOptions.length > 0;

  const isOffer = product?.is_offer && product?.offer_price && product?.offer_price < product?.price;
  const hasDiscount = (product?.discount_price && product?.discount_price < product?.price) || isOffer;
  const finalPrice = isOffer ? product?.offer_price : (product?.discount_price || product?.price);
  const originalPrice = product?.price;
  const discountPercentage = hasDiscount && originalPrice
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const getColorStock = (color: string) => {
    if (hasVariants) {
      const variant = colorVariants.find(v => v.color === color);
      return variant?.stock || 0;
    }
    return product?.stock ?? 99;
  };

  const getColorSizes = (color: string) => {
    if (hasVariants) {
      const variant = colorVariants.find(v => v.color === color);
      return variant?.sizes || [];
    }
    return legacySizeOptions;
  };

  const getTotalSelectedQuantity = () => {
    return colorSelections.reduce((sum, sel) => sum + sel.quantity, 0);
  };

  const getColorSizesQuantity = (color: string) => {
    const selection = colorSelections.find(s => s.color === color);
    if (!selection) return 0;
    return selection.sizes.reduce((sum, s) => sum + s.quantity, 0);
  };

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

  const decreaseColorQuantity = (color: string) => {
    setColorSelections(prev => {
      const existing = prev.find(s => s.color === color);
      if (!existing || existing.quantity <= 0) return prev;
      if (existing.quantity === 1) {
        return prev.filter(s => s.color !== color);
      }
      const newQty = existing.quantity - 1;
      const totalSizes = existing.sizes.reduce((sum, s) => sum + s.quantity, 0);
      let newSizes = [...existing.sizes];
      if (totalSizes > newQty) {
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

  const handleQuantityChange = (newQty: number) => {
    const maxStock = hasVariants 
      ? colorVariants.reduce((sum, v) => sum + v.stock, 0)
      : (product?.stock ?? 99);
    
    if (newQty < 1) return;
    if (newQty > maxStock) {
      toast.error(`الحد الأقصى المتاح هو ${maxStock} قطعة`);
      return;
    }
    setQuantity(newQty);
    if (getTotalSelectedQuantity() > newQty) {
      setColorSelections([]);
    }
  };

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
        navigator.clipboard.writeText(shareUrl);
        toast.success('تم نسخ رابط المنتج!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('تم نسخ رابط المنتج!');
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (goToCart: boolean = false) => {
    if (!product) return;

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

    if (!requiresColor) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product, [], []);
      }
    } else {
      addToCart(product, allSizes, allColors);
    }
    
    if (goToCart) {
      navigate('/cart');
    } else {
      toast.success(`✅ تم إضافة ${quantity} قطعة من "${product.name_ar || product.name}" للسلة`);
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

  const productImages = product.product_images && product.product_images.length > 0 
    ? product.product_images 
    : product.image_url 
      ? [{ image_url: product.image_url }] 
      : [];

  const stockQuantity = hasVariants 
    ? colorVariants.reduce((sum, v) => sum + v.stock, 0)
    : (product.stock ?? 0);

  const availableColors = hasVariants 
    ? colorVariants 
    : legacyColorOptions.map((c: string) => ({ color: c, sizes: legacySizeOptions, stock: 99 }));

  const ogImage = productImages[0]?.image_url || product.image_url || '/placeholder.svg';
  const ogTitle = product.name_ar || product.name || 'منتج';
  const ogDescription = product.description_ar || product.description || `${ogTitle} - ${finalPrice} جنيه`;

  return (
    <>
      <Helmet>
        <title>{ogTitle} | متجر زهرة</title>
        <meta name="description" content={ogDescription} />
        
        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`${window.location.origin}/product/${id}`} />
        <meta property="og:site_name" content="متجر زهرة" />
        
        {/* Product specific */}
        <meta property="product:price:amount" content={String(finalPrice)} />
        <meta property="product:price:currency" content="EGP" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowRight className="ml-2" />
            العودة
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* الصور */}
            <div className="relative">
              {hasDiscount && (
                <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-accent to-destructive border-0">
                  {isOffer ? '🔥 عرض خاص' : 'خصم'} {discountPercentage}%
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
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              )}
            </div>

            {/* التفاصيل */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name_ar || product.name}</h1>
                {product.name_en && <p className="text-lg text-muted-foreground">{product.name_en}</p>}
              </div>

              {product.categories && (
                <Badge variant="outline">{product.categories.name}</Badge>
              )}

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
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-destructive to-orange-500 transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                  />
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
                    {originalPrice} جنيه
                  </span>
                )}
                <span className={`text-3xl font-bold ${hasDiscount ? 'text-destructive' : 'text-primary'}`}>
                  {finalPrice} جنيه
                </span>
              </div>

              {product.description_ar && (
                <div>
                  <h3 className="font-semibold mb-2">الوصف</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{product.description_ar}</p>
                </div>
              )}

              {stockQuantity > 0 ? (
                <div className="space-y-4">
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
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* اختيار الألوان */}
                  {hasColors && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold">
                        اختر الألوان ({getTotalSelectedQuantity()}/{quantity})
                      </label>
                      <div className="space-y-3">
                        {availableColors.map((variant: any) => {
                          const color = typeof variant === 'string' ? variant : variant.color;
                          const colorSelection = colorSelections.find(s => s.color === color);
                          const colorQty = colorSelection?.quantity || 0;
                          const colorStock = getColorStock(color);
                          const sizes = getColorSizes(color);

                          return (
                            <div key={color} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{color}</span>
                                  <span className="text-xs text-muted-foreground">(متاح: {colorStock})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => decreaseColorQuantity(color)}
                                    disabled={colorQty <= 0}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-6 text-center font-bold">{colorQty}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    onClick={() => increaseColorQuantity(color)}
                                    disabled={getTotalSelectedQuantity() >= quantity || colorQty >= colorStock}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* المقاسات للون المختار */}
                              {colorQty > 0 && sizes.length > 0 && (
                                <div className="pt-2 border-t space-y-2">
                                  <label className="text-xs text-muted-foreground">
                                    اختر المقاسات ({getColorSizesQuantity(color)}/{colorQty})
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {sizes.map((size: string) => {
                                      const sizeQty = colorSelection?.sizes.find(s => s.size === size)?.quantity || 0;
                                      return (
                                        <div key={size} className="flex items-center gap-1 border rounded px-2 py-1">
                                          <span className="text-sm">{size}</span>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5"
                                            onClick={() => decreaseSizeQuantity(color, size)}
                                            disabled={sizeQty <= 0}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <span className="w-4 text-center text-sm font-bold">{sizeQty}</span>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5"
                                            onClick={() => increaseSizeQuantity(color, size)}
                                            disabled={getColorSizesQuantity(color) >= colorQty}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* أزرار الإجراءات */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleAddToCart(true)}
                    >
                      <ShoppingCart className="ml-2 h-5 w-5" />
                      اشتر الآن
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        variant="outline"
                        size="lg"
                        onClick={() => handleAddToCart(false)}
                      >
                        <Plus className="ml-2 h-5 w-5" />
                        أضف للسلة
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleWishlistToggle}
                        className={inWishlist ? 'text-destructive' : ''}
                      >
                        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                      </Button>
                      <Button size="lg" variant="outline" onClick={handleShare}>
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Badge variant="destructive" className="text-lg py-2 px-4">
                  نفذت الكمية
                </Badge>
              )}

              {stockQuantity <= (product.low_stock_threshold || 5) && stockQuantity > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  الكمية محدودة! متبقي {stockQuantity} قطعة فقط
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
