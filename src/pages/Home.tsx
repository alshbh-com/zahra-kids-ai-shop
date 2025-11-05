import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { OfferBanner } from "@/components/OfferBanner";
import { SeasonalSection } from "@/components/SeasonalSection";
import { AiChatAssistant } from "@/components/AiChatAssistant";
import { SearchBar } from "@/components/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/logo.jpg";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_images(*)
        `)
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      {/* Hero Section with Logo */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <img 
              src={logo} 
              alt="Zahra Fashion" 
              className="w-40 h-40 object-contain drop-shadow-lg animate-in fade-in zoom-in duration-500"
            />
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              مرحباً بك في متجر زهرة
            </h1>
            <p className="text-muted-foreground text-center">أفضل ملابس الأطفال بجودة عالية</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-8">
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

        {/* Seasonal Collections */}
        <SeasonalSection />

        {/* Category Tabs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">تصفح حسب الفئة</h2>
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 h-auto gap-2">
              <TabsTrigger value="all" className="text-base py-3">
                الكل 🎨
              </TabsTrigger>
              {categories?.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="text-base py-3"
                >
                  {category.name_ar}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {products?.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  لا توجد منتجات في هذه الفئة حالياً
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AiChatAssistant />
    </div>
  );
};

export default Home;
