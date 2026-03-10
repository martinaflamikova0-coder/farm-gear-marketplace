/**
 * Checks if a URL is from an external domain that blocks hotlinking.
 * Routes those URLs through our image proxy edge function.
 */

const PROXY_DOMAINS = [
  'werkzeug-und-maschinen.com',
];

function needsProxy(url: string): boolean {
  try {
    const parsed = new URL(url);
    return PROXY_DOMAINS.some(
      domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.svg';
  
  // Supabase storage or local URLs don't need proxy
  if (url.startsWith('/') || url.includes('supabase.co')) {
    return url;
  }

  if (needsProxy(url)) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== window.location.origin + '/placeholder.svg') {
    img.src = '/placeholder.svg';
  }
}
