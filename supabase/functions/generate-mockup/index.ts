import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOCKUP_PROMPTS = {
  library: `Create a realistic mobile app mockup screenshot showing a premium digital library interface for Instagram carousel templates. 

Design requirements:
- iPhone/mobile device frame visible
- Clean, elegant interface with warm nude/cream background
- List of carousel template cards with elegant typography
- Each card shows: title, colored badges (like "Topo de Funil", "Meio de Funil" in warm colors like burgundy, gold, terracotta)
- Small icons for copy and favorite actions on each card
- Premium, sophisticated aesthetic
- Colors: warm cream (#F5F0EB), burgundy red (#8B2635), soft gold accents
- Modern sans-serif font
- High quality, photorealistic mockup style
- Ultra high resolution`,

  structure: `Create a realistic mobile app mockup screenshot showing a premium digital course module interface.

Design requirements:
- iPhone/mobile device frame visible
- Clean interface showing course modules/lessons list
- Numbered modules (Módulo 1, Módulo 2, etc.) with lesson titles
- Progress indicators with circular progress bars
- Elegant typography with warm color palette
- Colors: warm cream background (#F5F0EB), burgundy accents (#8B2635), gold highlights
- Each module card shows an icon, title, and progress percentage
- Premium, sophisticated aesthetic like a luxury learning app
- Modern clean design
- Ultra high resolution`,

  tools: `Create a realistic mobile app mockup screenshot showing a premium digital notebook/planner interface.

Design requirements:
- iPhone/mobile device frame visible
- Clean notebook interface with sections for notes and planning
- Cards/sections with icons (target, calendar, trophy, checklist icons)
- Text areas with elegant placeholder content
- Warm cream background (#F5F0EB) with burgundy (#8B2635) and gold accents
- Premium, sophisticated aesthetic
- Clean typography and generous whitespace
- Looks like a high-end productivity/planner app
- Modern minimalist design
- Ultra high resolution`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();
    
    if (!type || !MOCKUP_PROMPTS[type as keyof typeof MOCKUP_PROMPTS]) {
      return new Response(
        JSON.stringify({ error: 'Invalid mockup type. Use: library, structure, or tools' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating ${type} mockup...`);

    const prompt = MOCKUP_PROMPTS[type as keyof typeof MOCKUP_PROMPTS];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated in response');
    }

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const fileName = `mockup-${type}-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mockups')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: publicUrl } = supabase.storage
      .from('mockups')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully:', publicUrl.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl.publicUrl,
        type,
        fileName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating mockup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
