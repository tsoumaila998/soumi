// In-memory cache for warm Vercel serverless function instances
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  data: any;
  status: number;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const tmdbApiKey = process.env.TMDB_API_KEY?.trim();

  // Extract path from Vercel dynamic route req.query.path or fallback to req.url
  let tmdbPath = '';
  if (req.query?.path) {
    if (Array.isArray(req.query.path)) {
      tmdbPath = req.query.path.join('/');
    } else {
      tmdbPath = String(req.query.path);
    }
  } else if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      // Strip leading /api/tmdb/ or /api/tmdb
      tmdbPath = urlObj.pathname.replace(/^\/?api\/tmdb\/?/, '');
    } catch {
      tmdbPath = '';
    }
  }

  // Clean leading slash
  if (tmdbPath.startsWith('/')) {
    tmdbPath = tmdbPath.slice(1);
  }

  if (!tmdbPath) {
    res.status(400).json({ error: 'Endpoint path is required' });
    return;
  }

  // Collect query parameters (ignoring 'path' which Vercel uses for dynamic routing)
  const queryParams = new URLSearchParams();

  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'path' && key !== 'api_key' && value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryParams.set(key, value[0]);
        } else {
          queryParams.set(key, String(value));
        }
      }
    }
  }

  // Fallback to URL searchParams if not in req.query
  if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      for (const [key, value] of urlObj.searchParams.entries()) {
        if (key !== 'path' && key !== 'api_key' && !queryParams.has(key) && value) {
          queryParams.set(key, value);
        }
      }
    } catch {
      // ignore URL parsing error
    }
  }

  // Default language fallback if not passed
  if (!queryParams.has('language')) {
    queryParams.set('language', 'en-US');
  }

  // Generate cache key
  const sortedQuery = Array.from(queryParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const cacheKey = `${tmdbPath}?${sortedQuery}`;

  // Check cache
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    res.status(cached.status).json(cached.data);
    return;
  }

  // Verify TMDB_API_KEY presence
  if (!tmdbApiKey) {
    res.status(503).json({
      error: 'TMDB_API_KEY is not configured on Vercel environment variables',
      code: 'MISSING_API_KEY',
      path: tmdbPath,
    });
    return;
  }

  // Add the API key securely on backend
  queryParams.set('api_key', tmdbApiKey);
  const targetUrl = `https://api.themoviedb.org/3/${tmdbPath}?${queryParams.toString()}`;

  try {
    const tmdbResponse = await fetch(targetUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await tmdbResponse.json();

    if (tmdbResponse.ok) {
      memoryCache.set(cacheKey, {
        data,
        status: tmdbResponse.status,
        timestamp: now,
      });
      res.setHeader('X-Cache', 'MISS');
      res.status(tmdbResponse.status).json(data);
    } else {
      res.status(tmdbResponse.status).json({
        error: data.status_message || 'TMDb API request failed',
        code: data.status_code || tmdbResponse.status,
      });
    }
  } catch (error: any) {
    console.error('Error proxying to TMDb in Vercel serverless function:', error.message);
    res.status(502).json({
      error: 'Unable to connect to TMDb API',
      code: 'NETWORK_ERROR',
    });
  }
}
