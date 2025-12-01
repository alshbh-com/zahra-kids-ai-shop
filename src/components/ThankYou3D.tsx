import { useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

interface ThankYou3DProps {
  onComplete: () => void;
}

export const ThankYou3D = ({ onComplete }: ThankYou3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent animate-in fade-in zoom-in duration-500">
      <div 
        ref={containerRef}
        className="relative text-center space-y-8 animate-in slide-in-from-bottom-8 duration-1000"
      >
        {/* 3D Animated Circle */}
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-lg animate-pulse"></div>
          <div className="absolute inset-4 rounded-full bg-white/30 backdrop-blur-lg animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-8 rounded-full bg-white/40 backdrop-blur-lg animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="w-24 h-24 text-white animate-in zoom-in duration-700 delay-500" strokeWidth={2} />
          </div>
        </div>

        {/* Thank You Text with 3D Effect */}
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-1000 delay-700">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            شكراً لك!
          </h1>
          <p className="text-2xl text-white/90 drop-shadow-lg">
            تم استلام طلبك بنجاح
          </p>
          <p className="text-xl text-white/80 drop-shadow-lg">
            من متجر زهرة
          </p>
          <div className="pt-4">
            <a 
              href="https://zahra.ink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg text-white/90 hover:text-white transition-colors underline decoration-2 underline-offset-4"
            >
              zahra.ink
            </a>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() > 0.5 ? '' : '-'}50px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
