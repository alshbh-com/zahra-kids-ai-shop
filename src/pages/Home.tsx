import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { OfferBanner } from "@/components/OfferBanner";
import { AiChatAssistant } from "@/components/AiChatAssistant";
import { SearchBar } from "@/components/SearchBar";
import { SnowEffect } from "@/components/SnowEffect";
import { ChristmasDecorations } from "@/components/ChristmasDecorations";
import { ChristmasBanner } from "@/components/ChristmasBanner";
import { Facebook, Instagram, Ruler, Sparkles, TreePine, Gift, Star } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

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
      
      // ترتيب الصور حسب display_order لكل منتج
      return data?.map(product => ({
        ...product,
        product_images: product.product_images?.sort((a: any, b: any) => 
          (a.display_order || 0) - (b.display_order || 0)
        )
      }));
    },
  });

  // تصفية المنتجات حسب البحث والسعر
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = !searchQuery || 
      product.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // استخدام السعر الصحيح: discount_price إذا موجود، وإلا price
    const effectivePrice = product.discount_price || product.offer_price || product.price;
    const matchesPrice = !maxPrice || effectivePrice <= maxPrice;
    
    return matchesSearch && matchesPrice;
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24 christmas-pattern relative overflow-hidden">
      {/* Snow Effect */}
      <SnowEffect />
      
      {/* Christmas Decorations */}
      <ChristmasDecorations />

      {/* Hero Section with Christmas Theme */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ background: "var(--gradient-festive)" }}
        />
        {/* Christmas lights at top */}
        <div className="absolute top-0 left-0 right-0 h-4 flex justify-around items-center">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-twinkle"
              style={{
                backgroundColor: i % 3 === 0 ? "hsl(0, 80%, 50%)" : i % 3 === 1 ? "hsl(140, 60%, 40%)" : "hsl(45, 90%, 55%)",
                animationDelay: `${i * 0.1}s`,
                boxShadow: `0 0 10px currentColor`,
              }}
            />
          ))}
        </div>
        
        <div className="relative container mx-auto px-4 py-8 pt-12">
          <div className="flex flex-col items-center gap-4">
            {/* Christmas tree icon above logo */}
            <div className="flex items-center gap-2 animate-float">
              <TreePine className="w-8 h-8 text-secondary" />
              <Star className="w-6 h-6 text-accent fill-current animate-twinkle" />
              <TreePine className="w-8 h-8 text-secondary" />
            </div>
            
            <div className="relative">
              <img 
                src={logo} 
                alt="Zahra Fashion" 
                className="w-40 h-40 object-contain drop-shadow-lg animate-in fade-in zoom-in duration-500"
              />
              {/* Decorative glow around logo */}
              <div className="absolute inset-0 rounded-full animate-glow-pulse opacity-50" />
            </div>
            
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              🎄 مرحباً بك في متجر زهرة 🎅
            </h1>
            <p className="text-muted-foreground text-center flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              أفضل ملابس الأطفال بجودة عالية
              <Gift className="w-5 h-5 text-secondary" />
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
                onClick={() => window.open("https://whatsapp.com/channel/0029VbBAFd5AojYxdueWjt0I", "_blank")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
                onClick={() => window.open("https://www.facebook.com/share/1S2E4pmTMk/", "_blank")}
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
                onClick={() => window.open("https://vm.tiktok.com/ZSHcsqADrCvcn-4c9Hk/", "_blank")}
              >
                <SiTiktok className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
                onClick={() => window.open("https://www.instagram.com/zahra19981389?igsh=cnB1MjRwdmowdnQw", "_blank")}
              >
                <Instagram className="w-5 h-5" />
              </Button>
            </div>

            {/* AI Features Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                className="rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 hover:border-primary hover:bg-primary/20 transition-all"
                onClick={() => navigate('/size-detector')}
              >
                <Ruler className="w-4 h-4 ml-2" />
                قياس المقاس AI
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/30 hover:border-secondary hover:bg-secondary/20 transition-all"
                onClick={() => navigate('/ar-filter')}
              >
                <Sparkles className="w-4 h-4 ml-2" />
                فلتر AR
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-8 relative z-10">
        {/* Christmas Banner */}
        <ChristmasBanner />

        {/* Search Bar with Voice/Image and Price Filter */}
        <SearchBar 
          onSearch={setSearchQuery}
          onPriceFilter={setMaxPrice}
        />

        {/* Active Offers */}
        {offers && offers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary animate-swing" />
              العروض الحالية 🎁
              <TreePine className="w-6 h-6 text-secondary animate-swing" style={{ animationDelay: "0.3s" }} />
            </h2>
            <div className="grid gap-4">
              {offers.map((offer) => (
                <OfferBanner key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-accent fill-current animate-twinkle" />
              المنتجات
              <Sparkles className="w-5 h-5 text-accent" />
            </h2>
            {(searchQuery || maxPrice) && (
              <span className="text-sm text-muted-foreground">
                {filteredProducts?.length} منتج
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
              <TreePine className="w-12 h-12 text-secondary/30" />
              {searchQuery || maxPrice ? "لا توجد منتجات مطابقة" : "لا توجد منتجات حالياً"}
            </div>
          )}
        </div>

        {/* About Us Section - Christmas themed */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-primary/20 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-2 right-2 text-secondary/20">
            <TreePine className="w-16 h-16" />
          </div>
          <div className="absolute bottom-2 left-2 text-primary/20">
            <Gift className="w-12 h-12" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-accent fill-current" />
            من نحن 🎄
            <Star className="w-6 h-6 text-accent fill-current" />
          </h2>
          <div className="text-muted-foreground leading-relaxed text-center space-y-4 relative z-10">
            <p>
              في <span className="text-primary font-bold">zahra.ink</span> بنقدملك تجربة تسوّق مختلفة تمامًا عن أي مكان تاني.
            </p>
            <p>
              إحنا مش مجرد وسيط أو تاجر تجزئة، إحنا بنشتغل مباشرة مع المصانع علشان نوفّرلك الملابس بأعلى جودة وبسعر المصنع من غير أي زيادة.
            </p>
            <p>
              الملابس اللي عندنا بتيجي مباشرة من خطوط الإنتاج، يعني نفس القطع اللي بتخرج من المصنع بتكون جاهزة ليك على طول — من غير وسطاء، من غير عمولات، ومن غير أسعار مبالغ فيها.
            </p>
            <p>
              هدفنا إن كل عميل يقدر يشتري لبس أنيق بجودة ممتازة وسعر عادل.
            </p>
            <p className="text-foreground font-semibold">
              🎁 اختيارك لينا معناه إنك بتتعامل مع مصدر موثوق بيقدّم القيمة الحقيقية للمنتج. ✨
            </p>
          </div>
        </div>

        {/* Customer Service Section - Christmas themed */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 rounded-2xl p-6 shadow-lg border border-accent/30 relative overflow-hidden">
          {/* Decorative lights */}
          <div className="absolute top-0 left-0 right-0 flex justify-around">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-twinkle -mt-1"
                style={{
                  backgroundColor: i % 2 === 0 ? "hsl(45, 90%, 50%)" : "hsl(0, 80%, 50%)",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
            <Gift className="w-6 h-6 text-primary animate-swing" />
            خدمة العملاء 🎅
            <TreePine className="w-6 h-6 text-secondary" />
          </h2>
          <p className="text-muted-foreground text-center mb-4">للاستفسارات والمساعدة، تواصل معنا على واتساب:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://wa.me/201033050236" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-card px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 border border-secondary/30 hover:border-secondary"
            >
              <span className="text-lg font-bold text-secondary">01033050236</span>
              <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            <a 
              href="tel:01002989846" 
              className="flex items-center gap-2 bg-card px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 border border-primary/30 hover:border-primary"
            >
              <span className="text-lg font-bold text-primary">01002989846</span>
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AiChatAssistant />
    </div>
  );
};

export default Home;
