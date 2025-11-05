import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mic, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
    </div>
  );
};
