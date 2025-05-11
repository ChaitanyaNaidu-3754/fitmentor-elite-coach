
// Gemini API Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enhanced context with clearer formatting instructions
    const nutritionContext = "You are KAZNOR, a helpful nutrition assistant specializing in fitness. Provide accurate, science-backed nutrition advice, meal plans, and diet tips to support fitness goals. IMPORTANT INSTRUCTIONS FOR FORMATTING: 1) Use clear, direct language. 2) Avoid using markdown formatting like asterisks unless necessary. 3) Ensure all responses are complete without cutting off mid-sentence. 4) Be concise and informative - avoid unnecessary introductory or concluding remarks. 5) Focus strictly on providing helpful nutrition information related to the user's query.";

    // Call Gemini API with corrected endpoint and model (v1beta and gemini-2.0-flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: nutritionContext },
                { text: prompt }
              ]
            }
          ],
          // Keep some configuration parameters but adjusted for the new model
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    const data = await response.json();

    // Handle potential errors in the API response
    if (data.error) {
      console.error("Gemini API error:", data.error);
      return new Response(
        JSON.stringify({ error: `API Error: ${data.error.message || "Unknown error"}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract the response text from Gemini's response format, updated for new API structure
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response at this time.";

    return new Response(
      JSON.stringify({ generatedText }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in gemini-nutrition-chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
