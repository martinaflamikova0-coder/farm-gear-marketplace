const ALLOWED_EXTERNAL_DOMAINS = [
  'werkzeug-und-maschinen.com',
  'www.werkzeug-und-maschinen.com',
];

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    if (hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
      return false;
    }

    if (url.protocol !== 'https:') {
      return false;
    }

    return ALLOWED_EXTERNAL_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl || !isAllowedUrl(imageUrl)) {
      return new Response('Invalid or disallowed URL', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GeoItalyAgro/1.0)',
        'Accept': 'image/*',
        'Referer': imageUrl,
      },
    });

    if (!response.ok) {
      return new Response('Failed to fetch image', {
        status: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const imageBlob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new Response(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response('Proxy error', {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
});
