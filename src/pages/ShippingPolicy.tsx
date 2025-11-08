import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Clock, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShippingPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          العودة
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
              <Truck className="w-8 h-8 text-primary" />
              سياسة الشحن – Zahra Kids Fashion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              في Zahra نسعى لتوصيل طلبك في أسرع وقت وبأفضل جودة ممكنة 🌸
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">🚚 مدة الشحن:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>داخل نفس المدينة:</strong> من 1 إلى 2 يوم عمل</li>
                    <li>• <strong>داخل المحافظات الأخرى:</strong> من 2 إلى 5 أيام عمل</li>
                    <li className="text-sm">قد تزيد المدة قليلًا في أوقات الضغط أو العروض الكبيرة، وسيتم إبلاغك بأي تأخير.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">💰 تكلفة الشحن:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• تختلف حسب المنطقة ويتم توضيحها قبل تأكيد الطلب</li>
                    <li>• شحن مجاني للطلبات التي تتجاوز مبلغ معين (يتم تحديده حسب العرض الحالي)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">📦 شركة الشحن:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• نتعامل مع شركات شحن موثوقة لضمان توصيل الطلب بأمان وفي الوقت المحدد</li>
                    <li>• يمكنك تتبع طلبك من خلال رقم التتبع الذي يتم إرساله بعد تأكيد الشحنة</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">📞 استلام الطلب:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• الرجاء التأكد من كتابة الاسم الكامل، العنوان الصحيح، ورقم الهاتف بدقة</li>
                    <li>• في حالة عدم الرد على مندوب الشحن أكثر من مرة، قد يتم إلغاء الطلب تلقائيًا</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingPolicy;
