import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, RotateCcw, Download, Share2, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Sticker {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface FilterFrame {
  id: string;
  name: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  overlay?: string;
}

const AVAILABLE_STICKERS = [
  { id: 'crown', name: 'تاج', emoji: '👑' },
  { id: 'heart', name: 'قلب', emoji: '❤️' },
  { id: 'star', name: 'نجمة', emoji: '⭐' },
  { id: 'flower', name: 'وردة', emoji: '🌸' },
  { id: 'butterfly', name: 'فراشة', emoji: '🦋' },
  { id: 'rainbow', name: 'قوس قزح', emoji: '🌈' },
  { id: 'sparkle', name: 'لمعة', emoji: '✨' },
  { id: 'bow', name: 'فيونكة', emoji: '🎀' },
  { id: 'balloon', name: 'بالون', emoji: '🎈' },
  { id: 'party', name: 'حفلة', emoji: '🎉' },
  { id: 'unicorn', name: 'يونيكورن', emoji: '🦄' },
  { id: 'princess', name: 'أميرة', emoji: '👸' },
];

const FRAMES: FilterFrame[] = [
  { id: 'none', name: 'بدون إطار', borderColor: 'transparent', borderWidth: 0, borderRadius: 0 },
  { id: 'pink', name: 'وردي', borderColor: '#ec4899', borderWidth: 12, borderRadius: 20 },
  { id: 'gold', name: 'ذهبي', borderColor: '#f59e0b', borderWidth: 12, borderRadius: 20 },
  { id: 'rainbow', name: 'قوس قزح', borderColor: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)', borderWidth: 12, borderRadius: 20 },
  { id: 'hearts', name: 'قلوب', borderColor: '#f43f5e', borderWidth: 16, borderRadius: 30 },
  { id: 'stars', name: 'نجوم', borderColor: '#8b5cf6', borderWidth: 16, borderRadius: 30 },
];

const ARPhotoFilter = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FilterFrame>(FRAMES[0]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }
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
    
    // Mirror the image for selfie camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopCamera();
    toast.success('تم التقاط الصورة! أضف الستيكرات والإطارات');
  };

  const addSticker = (stickerData: typeof AVAILABLE_STICKERS[0]) => {
    const newSticker: Sticker = {
      id: `${stickerData.id}-${Date.now()}`,
      name: stickerData.name,
      emoji: stickerData.emoji,
      x: 50,
      y: 30,
      scale: 1,
      rotation: 0,
    };
    setStickers([...stickers, newSticker]);
    setActiveStickerId(newSticker.id);
  };

  const updateStickerPosition = (id: string, x: number, y: number) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const removeSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
    setActiveStickerId(null);
  };

  const handleStickerDrag = (e: React.TouchEvent | React.MouseEvent, stickerId: string) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - container.left) / container.width) * 100;
    const y = ((clientY - container.top) / container.height) * 100;
    
    updateStickerPosition(stickerId, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  const exportImage = async () => {
    if (!capturedImage || !containerRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = capturedImage;
      });

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw frame background if selected
      if (selectedFrame.id !== 'none') {
        ctx.fillStyle = selectedFrame.borderColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create clipping path for image
        const borderW = selectedFrame.borderWidth * 2;
        ctx.beginPath();
        ctx.roundRect(borderW, borderW, canvas.width - borderW * 2, canvas.height - borderW * 2, selectedFrame.borderRadius);
        ctx.clip();
      }

      ctx.drawImage(img, 0, 0);

      // Draw stickers
      ctx.font = '80px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      stickers.forEach(sticker => {
        const x = (sticker.x / 100) * canvas.width;
        const y = (sticker.y / 100) * canvas.height;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(sticker.scale, sticker.scale);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.fillText(sticker.emoji, 0, 0);
        ctx.restore();
      });

      const dataUrl = canvas.toDataURL('image/png');
      
      // Download
      const link = document.createElement('a');
      link.download = `zahra-photo-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('تم حفظ الصورة!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء حفظ الصورة');
    }
  };

  const shareImage = async () => {
    if (!navigator.share) {
      toast.error('المشاركة غير متاحة على هذا المتصفح');
      return;
    }

    try {
      await navigator.share({
        title: 'صورتي من متجر زهرة',
        text: 'شوفوا صورتي الحلوة من متجر زهرة للأطفال! 🎀',
        url: window.location.origin,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
      }
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setStickers([]);
    setSelectedFrame(FRAMES[0]);
    setActiveStickerId(null);
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
            فلتر AR زهرة
          </h1>
          <div className="w-10" />
        </div>

        <Card className="mb-4 border-primary/20 overflow-hidden">
          <CardContent className="p-0">
            <div 
              ref={containerRef}
              className="relative aspect-[3/4] bg-muted overflow-hidden"
              style={{
                borderWidth: selectedFrame.borderWidth,
                borderStyle: 'solid',
                borderColor: selectedFrame.borderColor,
                borderRadius: selectedFrame.borderRadius,
                background: selectedFrame.id === 'rainbow' 
                  ? 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)'
                  : undefined,
              }}
            >
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {!isStreaming && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Camera className="h-20 w-20 mb-4 opacity-50" />
                      <p className="text-center px-4">
                        افتح الكاميرا وخذ صورة حلوة!
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-full object-cover"
                  />
                  {stickers.map(sticker => (
                    <div
                      key={sticker.id}
                      className={`absolute cursor-move select-none transition-transform ${
                        activeStickerId === sticker.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                      }`}
                      style={{
                        left: `${sticker.x}%`,
                        top: `${sticker.y}%`,
                        transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                        fontSize: '3rem',
                      }}
                      onClick={() => setActiveStickerId(sticker.id)}
                      onTouchMove={(e) => handleStickerDrag(e, sticker.id)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setActiveStickerId(sticker.id);
                        const handleMove = (e: MouseEvent) => {
                          if (!containerRef.current) return;
                          const container = containerRef.current.getBoundingClientRect();
                          const x = ((e.clientX - container.left) / container.width) * 100;
                          const y = ((e.clientY - container.top) / container.height) * 100;
                          updateStickerPosition(sticker.id, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
                        };
                        const handleUp = () => {
                          document.removeEventListener('mousemove', handleMove);
                          document.removeEventListener('mouseup', handleUp);
                        };
                        document.addEventListener('mousemove', handleMove);
                        document.addEventListener('mouseup', handleUp);
                      }}
                    >
                      {sticker.emoji}
                    </div>
                  ))}
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="p-4">
              {!capturedImage ? (
                <div className="flex gap-2">
                  {!isStreaming ? (
                    <Button onClick={startCamera} className="flex-1" size="lg">
                      <Camera className="h-5 w-5 ml-2" />
                      فتح الكاميرا
                    </Button>
                  ) : (
                    <>
                      <Button onClick={capturePhoto} className="flex-1" size="lg">
                        <Camera className="h-5 w-5 ml-2" />
                        التقاط
                      </Button>
                      <Button onClick={stopCamera} variant="outline" size="lg">
                        إلغاء
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeStickerId && (
                    <Button 
                      onClick={() => removeSticker(activeStickerId)} 
                      variant="destructive" 
                      size="sm"
                      className="w-full"
                    >
                      حذف الستيكر المحدد
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={exportImage} className="flex-1">
                      <Download className="h-4 w-4 ml-2" />
                      حفظ
                    </Button>
                    <Button onClick={shareImage} variant="secondary" className="flex-1">
                      <Share2 className="h-4 w-4 ml-2" />
                      مشاركة
                    </Button>
                    <Button onClick={reset} variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {capturedImage && (
          <>
            <Card className="mb-4">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  🎨 الإطارات
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {FRAMES.map(frame => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 transition-all ${
                        selectedFrame.id === frame.id 
                          ? 'border-primary scale-110' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      style={{
                        background: frame.id === 'none' 
                          ? 'repeating-conic-gradient(#ccc 0 25%, transparent 0 50%) 50% / 10px 10px'
                          : frame.id === 'rainbow'
                          ? 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff)'
                          : frame.borderColor,
                      }}
                      title={frame.name}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  ✨ الستيكرات
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_STICKERS.map(sticker => (
                    <button
                      key={sticker.id}
                      onClick={() => addSticker(sticker)}
                      className="text-2xl p-2 rounded-lg hover:bg-primary/10 transition-colors active:scale-95"
                      title={sticker.name}
                    >
                      {sticker.emoji}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ARPhotoFilter;
