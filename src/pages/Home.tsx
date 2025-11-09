import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { OfferBanner } from "@/components/OfferBanner";
import { AiChatAssistant } from "@/components/AiChatAssistant";
import { SearchBar } from "@/components/SearchBar";
import { MobileMenu } from "@/components/MobileMenu";
import { Facebook, Instagram, Heart, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";

const Home = () => {
  const navigate = useNavigate();
  const { items: cartItems, totalAmount } = useCart();
  
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images(*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: offers } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Banner */}
      <div className="bg-[#D4A024] text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">خصومات وعروض مش هتلاقيها غير عندنا</p>
      </div>

      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Price and Cart */}
            <div className="flex items-center gap-2">
              <span className="text-sm">{totalAmount.toFixed(0)} ج.م</span>
              <Button
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A024] text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="7" width="20" height="15" rx="2" strokeWidth="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth="2"/>
                </svg>
              </Button>
            </div>

            {/* Center - Logo */}
            <div className="flex-1 flex justify-center">
              <img 
                src={logo} 
                alt="KzaMiza" 
                className="h-16 object-contain cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>

            {/* Right - Search, Heart, Menu */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5" />
              </Button>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 space-y-8 py-6">
        {/* Search Bar with Voice/Image */}
        <SearchBar />

        {/* Active Offers */}
        {offers && offers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">العروض الحالية 🎉</h2>
            <div className="grid gap-4">
              {offers.map((offer) => (
                <OfferBanner key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">المنتجات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              لا توجد منتجات حالياً
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AiChatAssistant />
    </div>
  );
};

export default Home;
