import { Card, CardContent } from "@/components/ui/card";
import { Backpack, Gift, Sun, Snowflake } from "lucide-react";

export const SeasonalSection = () => {
  const seasons = [
    {
      icon: Backpack,
      title: "العودة للمدرسة",
      description: "ملابس وحقائب مدرسية",
      gradient: "from-blue-500/10 to-green-500/10",
    },
    {
      icon: Gift,
      title: "الأعياد والمناسبات",
      description: "إطلالات مميزة للأعياد",
      gradient: "from-red-500/10 to-pink-500/10",
    },
    {
      icon: Sun,
      title: "مجموعة الصيف",
      description: "ملابس خفيفة ومريحة",
      gradient: "from-yellow-500/10 to-orange-500/10",
    },
    {
      icon: Snowflake,
      title: "مجموعة الشتاء",
      description: "دافئة وأنيقة",
      gradient: "from-cyan-500/10 to-blue-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">تسوق حسب الموسم 🎯</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {seasons.map((season) => {
          const Icon = season.icon;
          return (
            <Card
              key={season.title}
              className={`group cursor-pointer overflow-hidden bg-gradient-to-br ${season.gradient} hover:shadow-[var(--shadow-card)] transition-all duration-300`}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-background/50 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-primary" />
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
