import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight className="ml-2" />
          العودة
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-center">شروط الاستخدام</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-right">
          <section>
            <h2 className="text-2xl font-semibold mb-3">قبول الشروط</h2>
            <p className="text-muted-foreground">
              باستخدام موقع Kzamiza، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الموقع.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">استخدام الموقع</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li>يجب أن تكون فوق 18 عاماً لإجراء عمليات الشراء</li>
              <li>يجب تقديم معلومات صحيحة ودقيقة عند الطلب</li>
              <li>أنت مسؤول عن الحفاظ على سرية معلومات حسابك</li>
              <li>لا يجوز استخدام الموقع لأي أغراض غير قانونية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">المنتجات والأسعار</h2>
            <p className="text-muted-foreground">
              نبذل قصارى جهدنا لعرض المنتجات والأسعار بدقة. ومع ذلك، نحتفظ بالحق في:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li>تعديل الأسعار دون إشعار مسبق</li>
              <li>إلغاء الطلبات في حالة عدم توفر المنتج</li>
              <li>رفض الطلبات التي نشك في صحتها</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">الطلبات والدفع</h2>
            <p className="text-muted-foreground">
              عند تقديم طلب، فإنك توافق على:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li>دفع السعر المعروض بالإضافة إلى تكاليف الشحن</li>
              <li>تقديم عنوان توصيل صحيح</li>
              <li>استلام المنتج في الوقت المتفق عليه</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">الملكية الفكرية</h2>
            <p className="text-muted-foreground">
              جميع المحتويات على الموقع، بما في ذلك النصوص والصور والشعارات، محمية بحقوق الملكية الفكرية. لا يجوز استخدامها دون إذن كتابي مسبق.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">إخلاء المسؤولية</h2>
            <p className="text-muted-foreground">
              الموقع والخدمات متاحة "كما هي". لا نقدم أي ضمانات صريحة أو ضمنية بخصوص دقة أو اكتمال المعلومات على الموقع.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">التعديلات</h2>
            <p className="text-muted-foreground">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة. استخدامك المستمر للموقع بعد التغييرات يعني قبولك لها.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">التواصل</h2>
            <p className="text-muted-foreground">
              لأي استفسارات بخصوص الشروط والأحكام:
            </p>
            <p className="text-muted-foreground">
              واتساب: 01008512398<br/>
              البريد الإلكتروني: kzamizashop@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}