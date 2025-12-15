import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Read Gemini API key from Supabase secrets
const GEMINI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

// Helper function to convert ArrayBuffer to base64 in chunks
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured in Supabase secrets");
    }

    const { childImage, productImageUrl, productName } = await req.json();

    if (!childImage || !productImageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required images" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing virtual try-on for product:", productName);

    // Extract base64 data from childImage if it's a data URL
    let childImageBase64 = childImage;
    let childImageMimeType = "image/jpeg";
    if (childImage.startsWith("data:")) {
      const matches = childImage.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        childImageMimeType = matches[1];
        childImageBase64 = matches[2];
      }
    }

    // Fetch product image and convert to base64
    console.log("Fetching product image:", productImageUrl);
    const productResponse = await fetch(productImageUrl);
    if (!productResponse.ok) {
      throw new Error("Failed to fetch product image");
    }
    const productImageBuffer = await productResponse.arrayBuffer();
    const productImageBase64 = arrayBufferToBase64(productImageBuffer);
    const productContentType = productResponse.headers.get("content-type") || "image/jpeg";

    // Call Gemini API (Image model)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `You are an expert virtual clothing try-on AI for children's fashion. Your task:

1. ANALYZE the first image: Identify the child's body, pose, and proportions
2. EXTRACT the clothing item from the second image (${productName}): Focus only on the garment, ignore any background or model
3. TRANSFORM and FIT: Resize, rotate, and warp the extracted clothing to match the child's body position and proportions
4. COMPOSITE: Place the clothing naturally on the child, ensuring:
   - Proper layering (arms in front if needed)
   - Realistic shadows and lighting matching the original photo
   - The child's face, hair, and background remain completely unchanged
   - The clothing fits naturally as if the child is actually wearing it

Output a single realistic image of the child wearing the clothing item. The result should look like a real photograph, not a collage. Generate the image now.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: childImageMimeType,
                data: childImageBase64
              }
            },
            {
              inline_data: {
                mime_type: productContentType,
                data: productImageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    };

    // Retry logic for rate limiting
    let response: Response | null = null;
    let lastError = "";
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Calling Gemini API (attempt ${attempt}/3)...`);
      
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        break;
      }
      
      const errorText = await response.text();
      lastError = errorText;
      console.error(`Gemini API error (attempt ${attempt}):`, response.status, errorText);
      
      if (response.status === 429 && attempt < 3) {
        // Wait before retry (2s, then 4s)
        const waitTime = attempt * 2000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "خدمة AI مشغولة حالياً، يرجى المحاولة بعد دقيقة" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    if (!response || !response.ok) {
      throw new Error(`Gemini API failed after retries: ${lastError}`);
    }

    const data = await response.json();
    console.log("Gemini response received");

    // Extract the generated image from Gemini response
    let resultImage = null;
    
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          resultImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!resultImage) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated - Gemini may not support this request");
    }

    return new Response(
      JSON.stringify({ resultImage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
