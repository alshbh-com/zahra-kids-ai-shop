import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReturnPolicy = () => {
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
              <RefreshCw className="w-8 h-8 text-primary" />
              سياسة الاستبدال فقط – Zahra Kids Fashion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              في Zahra نحرص على رضا عملائنا، لذلك نوفر خدمة الاستبدال فقط في الحالات التالية 👇
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">✅ يمكن الاستبدال في الحالات التالية:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>1.</strong> إذا كان المنتج به عيب تصنيع أو تلف عند الاستلام</li>
                    <li><strong>2.</strong> إذا تم إرسال مقاس أو لون مختلف عن المطلوب</li>
                    <li><strong>3.</strong> إذا كان المنتج غير مستخدم وفي تغليفه الأصلي ومعه التيكت</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">🕓 مدة الاستبدال:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>خلال 48 ساعة</strong> من استلام الطلب داخل المدينة</li>
                    <li>• <strong>خلال 3 أيام عمل</strong> للمحافظات الأخرى</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">💬 ملاحظات مهمة:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong className="text-destructive">لا يوجد استرجاع نقدي تحت أي ظرف</strong></li>
                    <li>• يتحمل العميل مصاريف الشحن في حالة الاستبدال إلا في حال وجود خطأ من طرفنا</li>
                    <li>• في حال نفاد المنتج المطلوب للاستبدال، يمكن اختيار منتج آخر بنفس القيمة أو أعلى مع دفع الفرق</li>
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

export default ReturnPolicy;
