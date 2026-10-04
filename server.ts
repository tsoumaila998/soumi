import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Cache configuration: 10 minutes in milliseconds
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  data: any;
  status: number;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

// Clean expired cache items periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      memoryCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

// TMDb proxy handler
app.use('/api/tmdb', async (req: Request, res: Response) => {
  const tmdbApiKey = process.env.TMDB_API_KEY?.trim();

  // Strip leading slash from wildcard path
  const tmdbPath = req.path.startsWith('/') ? req.path.slice(1) : req.path;
  
  if (!tmdbPath) {
    res.status(400).json({ error: 'Endpoint path is required' });
    return;
  }

  // Extract query parameters
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'api_key' && typeof value === 'string') {
      queryParams.set(key, value);
    }
  }

  // Default language fallback if not passed
  if (!queryParams.has('language')) {
    queryParams.set('language', 'en-US');
  }

  // Generate cache key from path, sorted query parameters, and language
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
      error: 'TMDB_API_KEY is not configured on the server',
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

    // Cache successful responses and clean 404s
    if (tmdbResponse.ok) {
      memoryCache.set(cacheKey, {
        data,
        status: tmdbResponse.status,
        timestamp: now,
      });
      res.setHeader('X-Cache', 'MISS');
      res.status(tmdbResponse.status).json(data);
    } else {
      // Do not leak API key on error
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
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    tmdbConfigured: Boolean(process.env.TMDB_API_KEY?.trim()),
    timestamp: new Date().toISOString(),
  });
});

// Direct project archive download endpoint
app.get(['/soumi-project.tar.gz', '/download'], (_req, res) => {
  const filePath = path.resolve(__dirname, 'public', 'soumi-project.tar.gz');
  res.download(filePath, 'soumi-project.tar.gz');
});

async function startServer() {
  if (!isProduction) {
    // Vite middleware for development
    const vite = await import('vite').then((m) =>
      m.createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      })
    );
    app.use(vite.middlewares);
  } else {
    // Static file serving for production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOUMI server running on http://localhost:${PORT}`);
    console.log(`TMDb API Key Status: ${process.env.TMDB_API_KEY ? 'Configured' : 'Missing (using mock fallback)'}`);
  });
}

startServer();
