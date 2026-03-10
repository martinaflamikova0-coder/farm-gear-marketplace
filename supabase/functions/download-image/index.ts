import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin role
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: hasRole } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!hasRole) {
      return new Response(JSON.stringify({ error: 'Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageUrls } = await req.json();
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(JSON.stringify({ error: 'imageUrls array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const storedUrls: string[] = [];

    for (const imageUrl of imageUrls) {
      try {
        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
          storedUrls.push(imageUrl || '');
          continue;
        }

        // If already in our storage, skip
        if (imageUrl.includes('supabase.co/storage')) {
          storedUrls.push(imageUrl);
          continue;
        }

        // Download the image
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; EkipTrade/1.0)',
            'Accept': 'image/*',
          },
        });

        if (!response.ok) {
          console.error(`Failed to download ${imageUrl}: ${response.status}`);
          storedUrls.push(imageUrl); // Keep original as fallback
          continue;
        }

        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        // Determine extension
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('webp')) ext = 'webp';
        else if (contentType.includes('gif')) ext = 'gif';

        const fileName = `products/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, blob, {
            contentType,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload error for ${imageUrl}:`, uploadError);
          storedUrls.push(imageUrl);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        storedUrls.push(publicUrlData.publicUrl);
        console.log(`Downloaded & stored: ${imageUrl} -> ${publicUrlData.publicUrl}`);
      } catch (err) {
        console.error(`Error processing ${imageUrl}:`, err);
        storedUrls.push(imageUrl);
      }
    }

    return new Response(JSON.stringify({ success: true, storedUrls }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Download image error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
