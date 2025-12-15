import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// إجابات جاهزة بناءً على الكلمات المفتاحية
const getAutoResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();
  
  // التحية
  if (input.includes("مرحبا") || input.includes("اهلا") || input.includes("هاي") || input.includes("السلام")) {
    return "أهلاً وسهلاً بك في متجر زهرة! 🌸 كيف أقدر أساعدك؟";
  }
  
  // المنتجات
  if (input.includes("منتج") || input.includes("ملابس") || input.includes("لبس")) {
    return "نوفر ملابس أطفال عالية الجودة من سن حديثي الولادة حتى 12 سنة. تصفح المنتجات من الصفحة الرئيسية أو استخدم البحث 😊";
  }
  
  // الأسعار
  if (input.includes("سعر") || input.includes("كام") || input.includes("بكم") || input.includes("تكلف")) {
    return "أسعارنا تبدأ من 100 جنيه وحتى 500 جنيه حسب المنتج. كل العروض موجودة في الصفحة الرئيسية مع الأسعار 💰";
  }
  
  // الشحن
  if (input.includes("شحن") || input.includes("توصيل") || input.includes("delivery")) {
    return "نوفر توصيل لجميع محافظات مصر! 🚚 تكلفة الشحن تختلف حسب المحافظة (من 55 إلى 100 جنيه). الدفع عند الاستلام متاح.";
  }
  
  // الدفع
  if (input.includes("دفع") || input.includes("فلوس") || input.includes("payment")) {
    return "الدفع عند الاستلام متاح لجميع الطلبات 💳 مش محتاج تدفع أونلاين!";
  }
  
  // المقاسات
  if (input.includes("مقاس") || input.includes("سايز") || input.includes("size")) {
    return "عندنا مقاسات من حديثي الولادة حتى 12 سنة. لو محتاج مساعدة في اختيار المقاس، جرب أداة قياس المقاس من القائمة 📏";
  }
  
  // الإرجاع
  if (input.includes("رجع") || input.includes("استبدال") || input.includes("return")) {
    return "نوفر سياسة إرجاع واستبدال خلال 14 يوم من الاستلام. تواصل معنا على 01033050236 لأي استفسار 📞";
  }
  
  // التواصل
  if (input.includes("تواصل") || input.includes("رقم") || input.includes("واتس") || input.includes("whatsapp")) {
    return "للتواصل معنا:\n📞 01033050236\n📞 01002989846\nأو تابعنا على السوشيال ميديا من الصفحة الرئيسية!";
  }
  
  // المطور
  if (input.includes("مطور") || input.includes("صمم") || input.includes("برمج") || input.includes("عمل الموقع")) {
    return "تم تطوير موقع زهرة بواسطة شركة 𝘼𝙇𝙎𝙃𝘽𝙃 💻\nللتواصل: 01204486263";
  }
  
  // العروض
  if (input.includes("عرض") || input.includes("خصم") || input.includes("تخفيض") || input.includes("offer")) {
    return "عندنا عروض مستمرة على كل المنتجات! 🔥 تصفح الصفحة الرئيسية لمشاهدة أحدث العروض والخصومات.";
  }
  
  // الشكر
  if (input.includes("شكر") || input.includes("thanks") || input.includes("ممتاز")) {
    return "العفو! 😊 سعداء بخدمتك. لو محتاج أي حاجة تانية، أنا موجود!";
  }
  
  // إجابة افتراضية
  return "أهلاً بك! 😊 للمساعدة:\n• تصفح المنتجات من الصفحة الرئيسية\n• استخدم البحث للوصول لما تريد\n• للتواصل: 01033050236";
};

export const AiChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "أهلاً! كيف أقدر أساعدك؟ 🌸",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const response = getAutoResponse(input);
    const assistantMessage: Message = { role: "assistant", content: response };
    
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  };

  if (!isOpen) {
    return (
      <Button
        size="lg"
        className="fixed bottom-24 left-4 z-40 rounded-full w-16 h-16 shadow-lg bg-gradient-to-r from-primary to-secondary hover:scale-110 transition-transform"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <CardTitle className="text-lg">مساعد زهرة 🌸</CardTitle>
        <Button
          size="icon"
          variant="ghost"
          className="text-primary-foreground hover:bg-primary-foreground/20"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="اكتب رسالتك..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
