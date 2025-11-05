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
      chat: `أنت مساعد ذكي في متجر زهرة لملابس الأطفال.
مهمتك:
- عرض المنتجات الموجودة في المتجر فقط
- كن مختصراً جداً في الإجابات
- لا تقترح منتجات غير موجودة
- ركز على الوصف المباشر للمنتجات المتاحة

كن قليل الكلام ومباشر.`,
      
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
