import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Instagram, Share2, FileText, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SiTiktok } from "react-icons/si";

export const SocialLinks = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            تواصل معنا
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open("https://whatsapp.com/channel/0029VbBAFd5AojYxdueWjt0I", "_blank")}
          >
            <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            قناة واتساب
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open("https://www.facebook.com/share/1S2E4pmTMk/", "_blank")}
          >
            <Facebook className="w-5 h-5 ml-2" />
            فيسبوك
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open("https://www.instagram.com/zahra19981389?igsh=cnB1MjRwdmowdnQw", "_blank")}
          >
            <Instagram className="w-5 h-5 ml-2" />
            انستجرام
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open("https://vm.tiktok.com/ZSHcsqADrCvcn-4c9Hk/", "_blank")}
          >
            <SiTiktok className="w-5 h-5 ml-2" />
            تيك توك
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            السياسات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate("/shipping-policy")}
          >
            <Package className="w-5 h-5 ml-2" />
            سياسة الشحن
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate("/return-policy")}
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            سياسة الاستبدال
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
