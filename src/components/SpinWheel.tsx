import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Gift, X } from 'lucide-react';

interface SpinWheelProps {
  onClose: () => void;
}

const WHEEL_SEGMENTS = [
  { label: 'حاول مجددا', color: '#f43f5e', discount: 0, minOrder: 0 },
  { label: 'خصم 200 ج', color: '#ec4899', discount: 200, minOrder: 1000 },
  { label: 'خصم 300 ج', color: '#8b5cf6', discount: 300, minOrder: 2000 },
];

const SpinWheel = ({ onClose }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [wonPrize, setWonPrize] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('spinCount') || '0', 10);
    setSpinCount(count);
  }, []);

  const spin = () => {
    if (isSpinning || spinCount >= 2) return;

    setIsSpinning(true);
    
    // Determine result based on spin count
    let resultIndex: number;
    if (spinCount === 0) {
      // First spin: always "حاول مجددا"
      resultIndex = 0;
    } else {
      // Second spin: random between discount 200 or 300
      resultIndex = Math.random() > 0.5 ? 1 : 2;
    }

    // Calculate rotation to land on the result
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = resultIndex * segmentAngle + segmentAngle / 2;
    const spins = 5; // Number of full rotations
    const finalRotation = spins * 360 + (360 - targetAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const newSpinCount = spinCount + 1;
      setSpinCount(newSpinCount);
      localStorage.setItem('spinCount', newSpinCount.toString());

      const prize = WHEEL_SEGMENTS[resultIndex];
      
      if (prize.discount > 0) {
        setHasWon(true);
        setWonPrize(prize);
        // Save discount to localStorage for checkout
        localStorage.setItem('wheelDiscount', JSON.stringify({
          discount: prize.discount,
          minOrder: prize.minOrder
        }));
        toast.success(`🎉 مبروك! حصلت على خصم ${prize.discount} جنيه على الطلبات فوق ${prize.minOrder} جنيه!`);
      } else {
        if (newSpinCount < 2) {
          toast.info('حاول مرة أخرى! لديك فرصة ثانية 🎯');
        }
      }
    }, 4000);
  };

  const handleClose = () => {
    if (spinCount >= 2 || hasWon) {
      localStorage.setItem('wheelShown', 'true');
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-gradient-to-b from-primary/20 to-background border-primary/30">
        <div className="relative p-6 text-center">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4">
            <Gift className="h-10 w-10 mx-auto text-primary animate-bounce" />
            <h2 className="text-xl font-bold mt-2">🎁 عجلة الحظ!</h2>
            <p className="text-sm text-muted-foreground">
              {spinCount === 0 ? 'لف العجلة واربح خصم!' : spinCount === 1 && !hasWon ? 'فرصتك الأخيرة!' : 'شكراً لك!'}
            </p>
          </div>

          {/* Wheel Container */}
          <div className="relative w-64 h-64 mx-auto mb-4">
            {/* Arrow pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-primary" />
            </div>

            {/* Wheel */}
            <div
              className="w-full h-full rounded-full border-4 border-primary shadow-xl transition-transform ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '4s' : '0s',
                background: `conic-gradient(
                  ${WHEEL_SEGMENTS[0].color} 0deg 120deg,
                  ${WHEEL_SEGMENTS[1].color} 120deg 240deg,
                  ${WHEEL_SEGMENTS[2].color} 240deg 360deg
                )`
              }}
            >
              {WHEEL_SEGMENTS.map((segment, index) => {
                const angle = index * 120 + 60;
                return (
                  <div
                    key={index}
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    <span
                      className="text-white font-bold text-sm drop-shadow-lg"
                      style={{
                        transform: 'translateY(-70px)',
                      }}
                    >
                      {segment.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center button */}
            <button
              onClick={spin}
              disabled={isSpinning || spinCount >= 2}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center font-bold text-primary hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSpinning ? '🎲' : 'لف!'}
            </button>
          </div>

          {hasWon && wonPrize && (
            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg p-4 mb-4">
              <p className="font-bold text-lg">🎉 مبروك!</p>
              <p className="text-sm">
                حصلت على خصم {wonPrize.discount} جنيه
              </p>
              <p className="text-xs text-muted-foreground">
                على الطلبات فوق {wonPrize.minOrder} جنيه
              </p>
            </div>
          )}

          {spinCount >= 2 && !hasWon && (
            <p className="text-sm text-muted-foreground">
              انتهت محاولاتك، تسوق الآن! 🛍️
            </p>
          )}

          <Button onClick={handleClose} className="w-full">
            {hasWon ? 'تسوق الآن واستخدم الخصم!' : 'متابعة التسوق'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpinWheel;
