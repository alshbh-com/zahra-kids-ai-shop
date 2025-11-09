import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FloatingWhatsApp = () => {
  const handleClick = () => {
    window.open('https://wa.me/201008512398', '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-24 left-4 z-50 rounded-full w-14 h-14 p-0 shadow-lg bg-[#25D366] hover:bg-[#20BA5A]"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </Button>
  );
};