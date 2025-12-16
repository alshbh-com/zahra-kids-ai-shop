import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface CartSuggestionProps {
  cartProductIds: string[];
}

export const CartSuggestion = ({ cartProductIds }: CartSuggestionProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { addToCart } = useCart();

  const { data: suggestedProduct } = useQuery({
    queryKey: ["suggested-product", cartProductIds],
    queryFn: async () => {
      // جلب منتج عشوائي غير موجود في السلة
      let query = supabase
        .from("products")
        .select("*")
        .gt("stock", 0);
      
      if (cartProductIds.length > 0) {
        query = query.not("id", "in", `(${cartProductIds.join(",")})`);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      // اختيار منتج عشوائي
      return data[Math.floor(Math.random() * data.length)];
    },
    enabled: !dismissed
  });

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize("");
    setSelectedColor("");
  }, [suggestedProduct?.id]);

  if (dismissed || !suggestedProduct) return null;

  const hasSizes = suggestedProduct.size_options && suggestedProduct.size_options.length > 0;
  const hasColors = suggestedProduct.color_options && suggestedProduct.color_options.length > 0;
  const needsSelection = (hasSizes && !selectedSize) || (hasColors && !selectedColor);

  const handleAddToCart = () => {
    if (needsSelection) {
      toast.error("يرجى اختيار المقاس واللون أولاً");
      return;
    }

    addToCart(
      suggestedProduct,
      selectedSize ? [selectedSize] : [],
      selectedColor ? [selectedColor] : []
    );
    toast.success("تمت الإضافة للسلة ✅");
    setDismissed(true);
  };

  const displayPrice = suggestedProduct.discount_price || suggestedProduct.price;

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">قد يعجبك أيضاً</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-3">
          <img
            src={suggestedProduct.image_url || "/placeholder.svg"}
            alt={suggestedProduct.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{suggestedProduct.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-primary font-bold">{displayPrice} جنيه</span>
              {suggestedProduct.discount_price && suggestedProduct.price > suggestedProduct.discount_price && (
                <span className="text-xs text-muted-foreground line-through">
                  {suggestedProduct.price} جنيه
                </span>
              )}
            </div>

            {/* اختيار المقاس */}
            {hasSizes && (
              <div className="flex flex-wrap gap-1 mt-2">
                {suggestedProduct.size_options.map((size: string) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            )}

            {/* اختيار اللون */}
            {hasColors && (
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestedProduct.color_options.map((color: string) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            )}

            <Button
              size="sm"
              className="w-full mt-2 h-8"
              onClick={handleAddToCart}
              disabled={needsSelection}
            >
              <Plus className="w-3 h-3 ml-1" />
              أضف للسلة
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
