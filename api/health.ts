export default function handler(_req: any, res: any) {
  res.json({
    status: 'ok',
    tmdbConfigured: Boolean(process.env.TMDB_API_KEY?.trim()),
    timestamp: new Date().toISOString(),
    platform: 'vercel-serverless',
  });
}
