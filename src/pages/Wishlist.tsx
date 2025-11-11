import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart(item);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            المفضلة
          </h1>
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">لا توجد منتجات في المفضلة</p>
              <Link to="/">
                <Button>تصفح المنتجات</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          المفضلة ({items.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${item.id}`}>
                <div className="aspect-square relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name_ar}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">لا توجد صورة</span>
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold line-clamp-2 min-h-[3rem]">{item.name_ar}</h3>
                <div className="flex items-center gap-2">
                  {item.discount_price ? (
                    <>
                      <span className="text-xl font-bold text-primary">
                        {item.discount_price} ج.م
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {item.price} ج.م
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold">{item.price} ج.م</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    أضف للسلة
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;