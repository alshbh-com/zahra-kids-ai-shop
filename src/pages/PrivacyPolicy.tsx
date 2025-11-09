import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight className="ml-2" />
          العودة
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-center">سياسات الخصوصية</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-right">
          <section>
            <h2 className="text-2xl font-semibold mb-3">المقدمة</h2>
            <p className="text-muted-foreground">
              نحن في Kzamiza نلتزم بحماية خصوصيتك وأمان معلوماتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية بياناتك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">المعلومات التي نجمعها</h2>
            <p className="text-muted-foreground">
              نقوم بجمع المعلومات التالية عند استخدامك لموقعنا:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li>الاسم ومعلومات الاتصال (رقم الهاتف، البريد الإلكتروني)</li>
              <li>عنوان التوصيل</li>
              <li>معلومات الطلبات والمشتريات</li>
              <li>بيانات التصفح وملفات تعريف الارتباط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">استخدام المعلومات</h2>
            <p className="text-muted-foreground">
              نستخدم معلوماتك للأغراض التالية:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li>معالجة وتنفيذ طلباتك</li>
              <li>التواصل معك بخصوص طلباتك</li>
              <li>تحسين خدماتنا ومنتجاتنا</li>
              <li>إرسال العروض والتحديثات (بموافقتك)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">حماية المعلومات</h2>
            <p className="text-muted-foreground">
              نتخذ جميع التدابير الأمنية اللازمة لحماية معلوماتك من الوصول غير المصرح به أو التسريب. نستخدم تقنيات التشفير والخوادم الآمنة لحماية بياناتك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">مشاركة المعلومات</h2>
            <p className="text-muted-foreground">
              لا نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط مع شركات الشحن لتوصيل طلباتك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">حقوقك</h2>
            <p className="text-muted-foreground">
              لديك الحق في:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
              <li>الوصول إلى معلوماتك الشخصية</li>
              <li>تصحيح المعلومات غير الدقيقة</li>
              <li>طلب حذف معلوماتك</li>
              <li>الاعتراض على معالجة بياناتك</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">التواصل</h2>
            <p className="text-muted-foreground">
              لأي استفسارات بخصوص سياسة الخصوصية، يرجى التواصل معنا عبر:
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