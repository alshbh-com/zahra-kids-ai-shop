import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, RotateCcw, Download, Share2, ChevronRight, Sparkles, Upload, Shirt, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
}

type Step = 'capture' | 'select-product' | 'processing' | 'result';

const ARPhotoFilter = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<Step>('capture');
  const [isStreaming, setIsStreaming] = useState(false);
  const [childImage, setChildImage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, price')
        .not('image_url', 'is', null)
        .limit(20);
      
      if (!error && data) {
        setProducts(data);
      }
    };
    fetchProducts();
  }, []);

  const startCamera = async () => {
    try {
      // استخدام الكاميرا الخلفية بدلاً من الأمامية
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 720 }, height: { ideal: 960 } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('لم نتمكن من الوصول للكاميرا');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // رسم الصورة مباشرة بدون انعكاس (الكاميرا الخلفية)
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setChildImage(imageData);
    stopCamera();
    setStep('select-product');
    toast.success('تم التقاط الصورة! اختر المنتج للتجربة');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setChildImage(event.target?.result as string);
      setStep('select-product');
      toast.success('تم رفع الصورة! اختر المنتج للتجربة');
    };
    reader.readAsDataURL(file);
  };

  const processVirtualTryOn = async (product: Product) => {
    if (!childImage || !product.image_url) return;

    setSelectedProduct(product);
    setStep('processing');
    setIsProcessing(true);

    try {
      // تركيب صورة المنتج على صورة الطفل بدون AI
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // تحميل صورة الطفل
      const childImg = new Image();
      childImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        childImg.onload = () => resolve();
        childImg.onerror = reject;
        childImg.src = childImage;
      });

      // تحميل صورة المنتج
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        productImg.onload = () => resolve();
        productImg.onerror = reject;
        productImg.src = product.image_url!;
      });

      // ضبط حجم الكانفس
      canvas.width = childImg.width;
      canvas.height = childImg.height;

      // رسم صورة الطفل
      ctx.drawImage(childImg, 0, 0);

      // حساب حجم وموقع المنتج (في منتصف الصورة)
      const productWidth = canvas.width * 0.6;
      const productHeight = (productImg.height / productImg.width) * productWidth;
      const productX = (canvas.width - productWidth) / 2;
      const productY = canvas.height * 0.25;

      // إضافة شفافية خفيفة للمنتج
      ctx.globalAlpha = 0.85;
      ctx.drawImage(productImg, productX, productY, productWidth, productHeight);
      ctx.globalAlpha = 1;

      // إضافة شعار
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(10, canvas.height - 40, 120, 30);
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('zahra.ink 🎀', 20, canvas.height - 18);

      const result = canvas.toDataURL('image/jpeg', 0.9);
      setResultImage(result);
      setStep('result');
      toast.success('تم تركيب الملابس بنجاح!');
    } catch (error) {
      console.error('Virtual try-on error:', error);
      toast.error('حدث خطأ أثناء التجربة');
      setStep('select-product');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.download = `zahra-tryon-${Date.now()}.png`;
    link.href = resultImage;
    link.click();
    toast.success('تم حفظ الصورة!');
  };

  const shareResult = async () => {
    if (!navigator.share) {
      toast.error('المشاركة غير متاحة على هذا المتصفح');
      return;
    }

    try {
      await navigator.share({
        title: 'تجربة ملابس من متجر زهرة',
        text: `جربت ${selectedProduct?.name} من متجر زهرة! 🎀`,
        url: window.location.origin,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
      }
    }
  };

  const reset = () => {
    setChildImage(null);
    setSelectedProduct(null);
    setResultImage(null);
    setStep('capture');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 p-4 pb-24" dir="rtl">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            تجربة الملابس الافتراضية
          </h1>
          <div className="w-10" />
        </div>

        {/* Step 1: Capture/Upload Photo */}
        {step === 'capture' && (
          <Card className="mb-4 border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Shirt className="h-20 w-20 mb-4 opacity-50" />
                    <p className="text-center px-4 text-lg font-medium">
                      صوّر طفلك أو ارفع صورته
                    </p>
                    <p className="text-center px-4 text-sm mt-2">
                      ثم اختر المنتج ليتم تركيبه تلقائياً
                    </p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="p-4 space-y-3">
                {!isStreaming ? (
                  <>
                    <Button onClick={startCamera} className="w-full" size="lg">
                      <Camera className="h-5 w-5 ml-2" />
                      فتح الكاميرا
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">أو</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                    >
                      <Upload className="h-5 w-5 ml-2" />
                      رفع صورة من الجهاز
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} className="flex-1" size="lg">
                      <Camera className="h-5 w-5 ml-2" />
                      التقاط
                    </Button>
                    <Button onClick={stopCamera} variant="outline" size="lg">
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Product */}
        {step === 'select-product' && childImage && (
          <>
            <Card className="mb-4 border-primary/20">
              <CardContent className="p-2">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <img 
                    src={childImage} 
                    alt="صورة الطفل" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2">
                    <Button onClick={reset} variant="secondary" size="sm" className="w-full">
                      <RotateCcw className="h-4 w-4 ml-2" />
                      تغيير الصورة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <Shirt className="h-5 w-5 text-primary" />
                  اختر المنتج للتجربة
                </h3>
                
                {products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    جاري تحميل المنتجات...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                    {products.map(product => (
                      <button
                        key={product.id}
                        onClick={() => processVirtualTryOn(product)}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-105"
                      >
                        <img
                          src={product.image_url || ''}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                          <p className="text-white text-xs truncate">{product.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <Card className="border-primary/20">
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">جاري تركيب الملابس...</h3>
                <p className="text-muted-foreground">
                  يتم تركيب {selectedProduct?.name} على الصورة
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Result */}
        {step === 'result' && resultImage && (
          <Card className="mb-4 border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                <img 
                  src={resultImage} 
                  alt="النتيجة" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <Button onClick={downloadResult} className="flex-1">
                    <Download className="h-4 w-4 ml-2" />
                    حفظ الصورة
                  </Button>
                  <Button onClick={shareResult} variant="secondary" className="flex-1">
                    <Share2 className="h-4 w-4 ml-2" />
                    مشاركة
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setStep('select-product')} variant="outline" className="flex-1">
                    <Shirt className="h-4 w-4 ml-2" />
                    جرب منتج آخر
                  </Button>
                  <Button onClick={reset} variant="ghost">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ARPhotoFilter;
