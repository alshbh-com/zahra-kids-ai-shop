import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = "AIzaSyDfHHHrvAPIwn9Z4E5Ngks6xwWj24fPfIs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();
    console.log('AI Chat request:', { action, messageCount: messages?.length });

    // System prompts for different actions
    const systemPrompts: Record<string, string> = {
      chat: `أنت مساعد ذكي لمتجر "زهرة" لملابس الأطفال.

معلومات عن المتجر:
- اسم المتجر: زهرة (Zahra)
- التخصص: ملابس أطفال عالية الجودة
- العمر المستهدف: من حديثي الولادة حتى 12 سنة
- نوفر: ملابس يومية، ملابس المناسبات، أحذية، إكسسوارات
- التوصيل: متاح لجميع أنحاء مصر
- الدفع: عند الاستلام أو أونلاين

قواعد الرد:
✅ أجب فقط عن أسئلة تخص المتجر والمنتجات
✅ كن مهذباً ومختصراً (2-3 جمل بالكثير)
✅ ركز على المنتجات المتاحة فعلياً في المتجر
✅ ساعد العملاء في إيجاد ما يناسبهم
✅ وجّه العملاء لاستخدام البحث أو تصفح الفئات

❌ لا تخترع منتجات غير موجودة
❌ لا تعطي معلومات خاطئة عن الأسعار
❌ لا تجب عن أسئلة خارج نطاق المتجر
❌ لا تكتب ردود طويلة

مثال على الردود الجيدة:
- "أهلاً بك في متجر زهرة! نوفر ملابس أطفال من سن حديثي الولادة حتى 12 سنة. يمكنك تصفح المنتجات أو البحث عن ما تريد 😊"
- "نعم، لدينا فساتين للمناسبات بتصاميم جميلة. تفضل بتصفح قسم الفساتين أو استخدم البحث"
- "نوفر توصيل لجميع أنحاء مصر والدفع عند الاستلام متاح"`,
      
      voiceSearch: `أنت محلل ذكي للبحث الصوتي في متجر ملابس أطفال.
المستخدم يبحث عن منتجات باستخدام الصوت.
استخرج من كلامه:
- نوع الملابس المطلوبة
- الفئة العمرية
- الجنس (ولد/بنت)
- المقاس إن وجد
- اللون إن وجد
أعد النتيجة بصيغة JSON مثل: {"type": "فستان", "gender": "بنت", "age": 5}`,
      
      imageSearch: `أنت محلل ذكي للصور في متجر ملابس أطفال.
تم رفع صورة منتج.
قم بتحليل الصورة ووصف:
- نوع القطعة
- اللون
- النمط
- المناسبة
أعد وصفاً دقيقاً يساعد في البحث عن منتجات مشابهة.`,
    };

    const systemPrompt = systemPrompts[action || 'chat'] || systemPrompts.chat;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },
            ...messages.map((msg: any) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            })),
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                     'عذراً، لم أتمكن من معالجة طلبك. حاول مرة أخرى.';

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'عذراً، حدث خطأ. حاول مرة أخرى لاحقاً.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
