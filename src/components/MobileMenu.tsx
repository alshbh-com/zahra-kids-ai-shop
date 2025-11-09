import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export const MobileMenu = () => {
  const menuItems = [
    { title: "سياسات الخصوصية", path: "/privacy-policy" },
    { title: "شروط الاستخدام", path: "/terms" },
    { title: "سياسة الاستبدال و الاسترجاع", path: "/return-policy" },
    { title: "سياسة الشحن", path: "/shipping-policy" },
    { title: "تواصل معنا WhatsApp", path: "https://wa.me/201008512398", external: true },
    { title: "الأسئلة الشائعة", path: "/faq" },
  ];

  const socialLinks = [
    { icon: SiTiktok, href: "#", label: "TikTok" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center text-2xl">القائمة</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-4">
          {menuItems.map((item, index) => (
            item.external ? (
              <a
                key={index}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center py-3 px-4 rounded-lg hover:bg-muted transition-colors text-lg"
              >
                {item.title}
              </a>
            ) : (
              <Link
                key={index}
                to={item.path}
                className="text-center py-3 px-4 rounded-lg hover:bg-muted transition-colors text-lg"
              >
                {item.title}
              </Link>
            )
          ))}

          <div className="flex justify-center gap-4 my-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-8 h-8" />
              </a>
            ))}
          </div>

          <div className="text-center space-y-2 pt-4 border-t">
            <p className="text-lg font-medium" dir="ltr">01008512398</p>
            <p className="text-sm text-muted-foreground" dir="ltr">kzamizashop@gmail.com : البريد الإلكتروني</p>
          </div>

          <Button 
            className="w-full mt-4"
            size="lg"
            onClick={() => window.open('https://wa.me/201008512398', '_blank')}
          >
            اضغط هنا للشراء
          </Button>

          <div className="text-center mt-4 pt-4 border-t">
            <p className="font-bold text-lg">Kzamiza.com</p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Facebook className="w-4 h-4" />
              <span dir="ltr">44455529 011</span>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};