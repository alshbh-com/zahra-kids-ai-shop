import { Card, CardContent } from "@/components/ui/card";
import { TreePine, Gift, Star, Snowflake, PartyPopper } from "lucide-react";

export const SeasonalSection = () => {
  const seasons = [
    {
      icon: TreePine,
      title: "مجموعة الكريسماس",
      description: "ملابس احتفالية مميزة",
      gradient: "from-secondary/20 to-primary/20",
      iconColor: "text-secondary",
    },
    {
      icon: Gift,
      title: "هدايا رأس السنة",
      description: "أفكار هدايا رائعة للأطفال",
      gradient: "from-primary/20 to-accent/20",
      iconColor: "text-primary",
    },
    {
      icon: Star,
      title: "إطلالات الحفلات",
      description: "تألقي في المناسبات",
      gradient: "from-accent/20 to-secondary/20",
      iconColor: "text-accent",
    },
    {
      icon: Snowflake,
      title: "مجموعة الشتاء",
      description: "دافئة وأنيقة للبرد",
      gradient: "from-blue-500/10 to-secondary/20",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <PartyPopper className="w-6 h-6 text-primary animate-swing" />
        تسوق حسب المناسبة 🎄
        <TreePine className="w-6 h-6 text-secondary" />
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {seasons.map((season, index) => {
          const Icon = season.icon;
          return (
            <Card
              key={season.title}
              className={`group cursor-pointer overflow-hidden bg-gradient-to-br ${season.gradient} hover:shadow-[var(--shadow-christmas)] transition-all duration-300 border-accent/20`}
            >
              <CardContent className="p-6 text-center space-y-3 relative">
                {/* Decorative star */}
                <div 
                  className="absolute top-2 right-2 text-accent/30 animate-twinkle"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <Star className="w-4 h-4 fill-current" />
                </div>
                
                <div className={`w-16 h-16 mx-auto rounded-full bg-background/50 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform ${season.iconColor} animate-float`}
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg">{season.title}</h3>
                <p className="text-sm text-muted-foreground">{season.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
