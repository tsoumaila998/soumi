// In-memory cache for warm Vercel serverless function instances
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  data: any;
  status: number;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

export default async function handler(req: any, res: any) {
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

  let tmdbPath = '';

  if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const match = urlObj.pathname.match(/^\/?api\/tmdb\/(.+)$/);
      if (match && match[1]) {
        tmdbPath = match[1];
      }
    } catch {
      // ignore
    }
  }

  if (!tmdbPath) {
    const rawHeader = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'] || '';
    if (typeof rawHeader === 'string' && rawHeader) {
      try {
        const urlObj = new URL(rawHeader, 'http://localhost');
        const match = urlObj.pathname.match(/^\/?api\/tmdb\/(.+)$/);
        if (match && match[1]) {
          tmdbPath = match[1];
        }
      } catch {
        // ignore
      }
    }
  }

  if (!tmdbPath && req.query) {
    if (req.query.path) {
      tmdbPath = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
    } else if (req.query.endpoint) {
      tmdbPath = Array.isArray(req.query.endpoint) ? req.query.endpoint.join('/') : String(req.query.endpoint);
    }
  }

  tmdbPath = tmdbPath.replace(/^\/+|\/+$/g, '');

  if (!tmdbPath) {
    res.status(400).json({
      error: 'Endpoint sub-path is required',
      receivedUrl: req.url || '',
    });
    return;
  }

  const queryParams = new URLSearchParams();

  if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      for (const [key, value] of urlObj.searchParams.entries()) {
        if (key !== 'path' && key !== 'endpoint' && key !== 'api_key' && value) {
          queryParams.set(key, value);
        }
      }
    } catch {
      // ignore
    }
  }

  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (
        key !== 'path' &&
        key !== 'endpoint' &&
        key !== 'api_key' &&
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !queryParams.has(key)
      ) {
        if (Array.isArray(value)) {
          queryParams.set(key, value[0]);
        } else {
          queryParams.set(key, String(value));
        }
      }
    }
  }

  if (!queryParams.has('language')) {
    queryParams.set('language', 'en-US');
  }

  const sortedQuery = Array.from(queryParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const cacheKey = `${tmdbPath}?${sortedQuery}`;

  const cached = memoryCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    res.status(cached.status).json(cached.data);
    return;
  }

  if (!tmdbApiKey) {
    res.status(503).json({
      error: 'TMDB_API_KEY is not configured',
      code: 'MISSING_API_KEY',
      path: tmdbPath,
    });
    return;
  }

  queryParams.set('api_key', tmdbApiKey);
  const targetUrl = `https://api.themoviedb.org/3/${tmdbPath}?${queryParams.toString()}`;

  try {
    const tmdbResponse = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
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
    console.error('Error proxying to TMDb:', error.message);
    res.status(502).json({
      error: 'Unable to connect to TMDb API',
      code: 'NETWORK_ERROR',
    });
  }
}