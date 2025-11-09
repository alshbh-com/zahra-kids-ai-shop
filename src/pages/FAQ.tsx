import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function FAQ() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "كيف يمكنني تقديم طلب؟",
      answer: "يمكنك تصفح المنتجات، إضافتها للسلة، ثم إكمال الطلب عبر واتساب. سنتواصل معك لتأكيد الطلب وتفاصيل الشحن."
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل الدفع عند الاستلام أو التحويل البنكي. سيتم تأكيد طريقة الدفع عند التواصل معك."
    },
    {
      question: "كم يستغرق وقت التوصيل؟",
      answer: "عادة يستغرق التوصيل من 3-5 أيام عمل حسب موقعك. سنبلغك بموعد محدد عند تأكيد الطلب."
    },
    {
      question: "هل يمكنني إرجاع أو استبدال المنتج؟",
      answer: "نعم، يمكنك الإرجاع أو الاستبدال خلال 7 أيام من استلام المنتج. يرجى مراجعة سياسة الاستبدال والإرجاع للتفاصيل."
    },
    {
      question: "هل الأسعار شاملة الشحن؟",
      answer: "الأسعار المعروضة لا تشمل رسوم الشحن. سيتم حساب تكلفة الشحن حسب موقعك عند تأكيد الطلب."
    },
    {
      question: "كيف يمكنني التواصل مع خدمة العملاء؟",
      answer: "يمكنك التواصل معنا عبر واتساب على الرقم 01008512398 أو عبر البريد الإلكتروني kzamizashop@gmail.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight className="ml-2" />
          العودة
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-center">الأسئلة الشائعة</h1>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-right hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 p-6 bg-muted rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">لم تجد إجابة لسؤالك؟</h3>
          <p className="text-muted-foreground mb-4">تواصل معنا مباشرة وسنكون سعداء بمساعدتك</p>
          <Button onClick={() => window.open('https://wa.me/201008512398', '_blank')}>
            تواصل معنا عبر واتساب
          </Button>
        </div>
      </div>
    </div>
  );
}