import { TreePine, Star, Gift, Sparkles } from "lucide-react";

export const ChristmasDecorations = () => {
  return (
    <>
      {/* Corner Decorations */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-40">
        <div className="absolute top-4 left-4 text-secondary animate-swing origin-top">
          <TreePine className="w-12 h-12 drop-shadow-lg" />
        </div>
        <div className="absolute top-2 left-12 text-accent animate-twinkle">
          <Star className="w-6 h-6 fill-current" />
        </div>
      </div>

      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-40">
        <div className="absolute top-4 right-4 text-primary animate-swing origin-top">
          <Gift className="w-10 h-10 drop-shadow-lg" />
        </div>
        <div className="absolute top-2 right-14 text-accent animate-twinkle" style={{ animationDelay: "0.5s" }}>
          <Star className="w-5 h-5 fill-current" />
        </div>
      </div>

      {/* Garland at top */}
      <div className="fixed top-0 left-0 right-0 h-8 pointer-events-none z-40 overflow-hidden">
        <div className="flex justify-center items-start gap-4 -mt-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-twinkle"
              style={{
                backgroundColor: i % 3 === 0 ? "hsl(0, 80%, 45%)" : i % 3 === 1 ? "hsl(140, 60%, 35%)" : "hsl(45, 90%, 50%)",
                animationDelay: `${i * 0.2}s`,
                boxShadow: `0 0 10px currentColor`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating decorations on sides */}
      <div className="fixed bottom-20 left-4 pointer-events-none z-40 animate-float">
        <TreePine className="w-16 h-16 text-secondary drop-shadow-lg" />
      </div>

      <div className="fixed bottom-32 right-4 pointer-events-none z-40 animate-float" style={{ animationDelay: "1s" }}>
        <Gift className="w-12 h-12 text-primary drop-shadow-lg" />
      </div>

      {/* Sparkle decorations */}
      <div className="fixed top-1/4 left-8 pointer-events-none z-40 animate-twinkle" style={{ animationDelay: "0.3s" }}>
        <Sparkles className="w-6 h-6 text-accent" />
      </div>
      
      <div className="fixed top-1/3 right-8 pointer-events-none z-40 animate-twinkle" style={{ animationDelay: "0.8s" }}>
        <Sparkles className="w-8 h-8 text-accent" />
      </div>
      
      <div className="fixed bottom-1/3 left-12 pointer-events-none z-40 animate-twinkle" style={{ animationDelay: "1.2s" }}>
        <Star className="w-5 h-5 text-accent fill-current" />
      </div>
    </>
  );
};
