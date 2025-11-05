import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface OfferBannerProps {
  offer: any;
}

export const OfferBanner = ({ offer }: OfferBannerProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!offer.end_date) return;

    const calculateTimeLeft = () => {
      const end = new Date(offer.end_date).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft("انتهى العرض");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days} يوم ${hours} ساعة ${minutes} دقيقة`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [offer.end_date]);

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 border-2 border-primary/20 animate-in slide-in-from-top-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-accent to-primary border-0">
                عرض خاص
              </Badge>
              {offer.discount_percentage && (
                <Badge variant="outline" className="text-lg px-3">
                  خصم {offer.discount_percentage}%
                </Badge>
              )}
            </div>
            <h3 className="text-2xl font-bold">{offer.title_ar}</h3>
            <p className="text-sm text-muted-foreground">{offer.title_en}</p>
            {offer.description_ar && (
              <p className="text-base">{offer.description_ar}</p>
            )}
          </div>

          {timeLeft && (
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur rounded-lg border">
              <Clock className="w-5 h-5 text-primary" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">متبقي</p>
                <p className="font-bold text-sm">{timeLeft}</p>
              </div>
            </div>
          )}

          {offer.remaining_quantity && (
            <Badge variant="destructive" className="text-base px-4 py-2">
              {offer.remaining_quantity} قطعة متبقية!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
