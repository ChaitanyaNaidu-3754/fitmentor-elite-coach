
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

    // Prepare the system context and user prompt
    const nutritionContext = "You are a helpful nutrition assistant specializing in fitness. Provide accurate, science-backed nutrition advice, meal plans, and diet tips to support fitness goals. Keep responses constructive, practical, and tailored to the user's query.";

    // Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + geminiApiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: nutritionContext },
                { text: prompt }
              ]
            }
          ],
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

    // Extract the response text from Gemini's response format
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
