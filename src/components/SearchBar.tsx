import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Mic, Image as ImageIcon, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onPriceFilter?: (maxPrice: number | null) => void;
}

export const SearchBar = ({ onSearch, onPriceFilter }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("المتصفح لا يدعم البحث الصوتي");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("استمع... 🎤");
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      toast.success("تم التعرف على الصوت!");
      
      // Process voice search with AI
      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: { 
            messages: [{ role: 'user', content: transcript }],
            action: 'voiceSearch'
          }
        });

        if (error) throw error;
        toast.success("جاري البحث عن المنتجات المطلوبة...");
        console.log("Voice search result:", data);
      } catch (error) {
        console.error("Voice search error:", error);
        toast.error("حدث خطأ في البحث الصوتي");
      } finally {
        setIsSearching(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("حدث خطأ في البحث الصوتي");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageSearch = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setIsSearching(true);
      toast.info("جاري تحليل الصورة...");
      
      try {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Image = event.target?.result as string;
          
          const { data, error } = await supabase.functions.invoke('ai-chat', {
            body: { 
              messages: [{ 
                role: 'user', 
                content: `تحليل صورة للبحث عن منتجات مشابهة. الصورة: ${base64Image.substring(0, 100)}...`
              }],
              action: 'imageSearch'
            }
          });

          if (error) throw error;
          toast.success("تم تحليل الصورة! جاري البحث...");
          console.log("Image search result:", data);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Image search error:", error);
        toast.error("حدث خطأ في البحث بالصورة");
      } finally {
        setIsSearching(false);
      }
    };
    input.click();
  };

  const handlePriceFilterToggle = () => {
    if (showPriceFilter) {
      onPriceFilter?.(null);
      setShowPriceFilter(false);
      toast.success("تم إلغاء فلتر السعر");
    } else {
      setShowPriceFilter(true);
      onPriceFilter?.(maxPrice);
      toast.success(`عرض المنتجات حتى ${maxPrice} جنيه`);
    }
  };

  const handlePriceChange = (value: number[]) => {
    const newPrice = value[0];
    setMaxPrice(newPrice);
    if (showPriceFilter) {
      onPriceFilter?.(newPrice);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحث عن ملابس، مقاسات، ألوان..."
            className="pr-10 h-12 text-base"
            disabled={isSearching || isListening}
          />
        </div>
        <Button
          size="lg"
          variant="outline"
          onClick={handleVoiceSearch}
          disabled={isSearching || isListening}
          className={isListening ? "animate-pulse bg-accent" : ""}
        >
          <Mic className="w-5 h-5" />
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          onClick={handleImageSearch}
          disabled={isSearching || isListening}
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        <Button
          size="lg"
          variant={showPriceFilter ? "default" : "outline"}
          onClick={handlePriceFilterToggle}
          disabled={isSearching || isListening}
        >
          <DollarSign className="w-5 h-5" />
        </Button>
      </div>

      {showPriceFilter && (
        <div className="bg-card p-4 rounded-lg border space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">الميزانية المتاحة:</span>
            <span className="text-lg font-bold text-primary">{maxPrice} جنيه</span>
          </div>
          <Slider
            value={[maxPrice]}
            onValueChange={handlePriceChange}
            max={2000}
            min={50}
            step={10}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground text-center">
            عرض العروض من {maxPrice} جنيه للأقل 💰
          </p>
        </div>
      )}
    </div>
  );
};
