import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childImage, productImageUrl, productName } = await req.json();

    if (!childImage || !productImageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required images" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing virtual try-on for product:", productName);

    // Use the image generation model to edit/overlay the product on the child
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert virtual clothing try-on AI for children's fashion. Your task:

1. ANALYZE the first image: Identify the child's body, pose, and proportions
2. EXTRACT the clothing item from the second image (${productName}): Focus only on the garment, ignore any background or model
3. TRANSFORM and FIT: Resize, rotate, and warp the extracted clothing to match the child's body position and proportions
4. COMPOSITE: Place the clothing naturally on the child, ensuring:
   - Proper layering (arms in front if needed)
   - Realistic shadows and lighting matching the original photo
   - The child's face, hair, and background remain completely unchanged
   - The clothing fits naturally as if the child is actually wearing it

Output a single realistic image of the child wearing the clothing item. The result should look like a real photograph, not a collage.`
              },
              {
                type: "image_url",
                image_url: {
                  url: childImage
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: productImageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the generated image
    const resultImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!resultImage) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated");
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
