import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Share2, Eye, Flame } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  // أعداد وهمية للمشاهدين (عشوائية بين 300-800)
  const [viewersCount] = useState(Math.floor(Math.random() * (800 - 300 + 1)) + 300);

  const handleShare = () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(productUrl);
    toast.success("تم نسخ رابط المنتج!");
  };

  return (
    <Card className="group overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 cursor-pointer">
      <div className="relative overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 z-10 bg-gradient-to-r from-accent to-destructive border-0">
            خصم {discountPercentage}%
          </Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-primary to-secondary border-0">
            مميز ⭐
          </Badge>
        )}
        <img
          src={product.product_images?.[0]?.image_url || "/placeholder.svg"}
          alt={product.name_ar}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{product.name_ar}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{product.name_en}</p>
        </div>

        {/* عدد المشاهدين */}
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-primary" />
          <span className="font-medium text-primary">{viewersCount}</span>
          <span className="text-muted-foreground">يشاهدون الآن</span>
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
        </div>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price} جنيه
            </span>
          )}
          <span className="text-xl font-bold text-primary">
            {hasDiscount ? product.discount_price : product.price} جنيه
          </span>
        </div>

        {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500">
            <Flame className="w-3 h-3 ml-1 animate-pulse" />
            الكمية محدودة - اسرع للشراء!
          </Badge>
        )}

        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={product.stock_quantity === 0}
          >
            {product.stock_quantity === 0 ? 'نفذت الكمية' : 'أضف للسلة'}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
