import { TreePine, Gift, Sparkles, PartyPopper } from "lucide-react";

export const ChristmasBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-primary p-6 mb-6 animate-glow-pulse">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-4 text-white">
          <TreePine className="w-20 h-20" />
        </div>
        <div className="absolute bottom-2 right-4 text-white">
          <Gift className="w-16 h-16" />
        </div>
        <div className="absolute top-4 right-1/4 text-accent">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-4 left-1/4 text-accent">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white">
        <div className="flex items-center justify-center gap-3 mb-2">
          <PartyPopper className="w-8 h-8 animate-swing" />
          <h2 className="text-2xl md:text-3xl font-bold">
            🎄 عروض رأس السنة والكريسماس 🎅
          </h2>
          <PartyPopper className="w-8 h-8 animate-swing" style={{ animationDelay: "0.5s" }} />
        </div>
        <p className="text-lg opacity-90">
          خصومات مميزة بمناسبة الأعياد! 🎁
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm font-medium">
            خصم يصل إلى 50%
          </span>
          <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium animate-float">
            توصيل مجاني
          </span>
        </div>
      </div>

      {/* Decorative lights */}
      <div className="absolute top-0 left-0 right-0 flex justify-around">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-twinkle -mt-1"
            style={{
              backgroundColor: i % 2 === 0 ? "hsl(45, 90%, 50%)" : "hsl(0, 80%, 70%)",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
