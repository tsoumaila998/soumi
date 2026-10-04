# SOUMI

A bilingual movie and TV discovery platform powered by TMDb.

---

## Features

- **Trending movies**: Dynamic weekly trending titles with high-resolution artwork and verified ratings.
- **Popular movies**: Curated blockbuster and popular cinema selections updated in real time.
- **Popular TV shows**: Binge-worthy television series and drama discovery.
- **Top rated movies**: Critically acclaimed films with verified community ratings.
- **Upcoming movies**: Anticipated cinema titles with scheduled release dates.
- **Movie details**: Comprehensive overviews, runtime, release dates, director credits, and genres.
- **TV details**: Season breakdowns, episode counts, and status information.
- **Search**: Instant multi-search across movies, TV series, actors, and keywords with debouncing.
- **Genres**: Catalog exploration with official TMDb genre classification.
- **Cast**: Top-billed actors with profile photos and character names.
- **Trailers**: Official YouTube trailer playback modals with graceful fallback handling.
- **Similar titles**: Algorithmic recommendations for related films and series.
- **My List**: Personal watchlist saved in `localStorage`, persisting across sessions and browser restarts.
- **English / French**: Complete bilingual i18n system with instant language switching (`en-US` and `fr-FR`).
- **Responsive design**: Tailored dark streaming-platform aesthetic for mobile (320px+), tablet, laptop, and desktop.
- **TMDb integration**: Server-side proxy with 10-minute in-memory caching and zero frontend API key exposure.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router 7, Vite 8, Tailwind CSS, Lucide React, React.lazy route code-splitting
- **Backend**: Node.js, Express 4, TypeScript (`tsx`)
- **API & Data**: The Movie Database (TMDb) API v3, YouTube Video Embeds
- **Storage**: Client-side `localStorage` for user watchlists
- **Tooling**: ESLint, TypeScript compiler (`tsc`)

---

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root directory:

```bash
cp .env.example .env
```

Add your TMDb API key to `.env`:

```env
TMDB_API_KEY=your_tmdb_api_key_here
PORT=3000
```

> **IMPORTANT**: The TMDb API key must strictly remain server-side. The frontend client never imports or exposes the secret key in bundle files. All communication is securely handled through the backend proxy.

---

## Development

To start the local development server (running Express with Vite middleware):

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## Production

To build the client bundle for production:

```bash
npm run build
```

This compiles optimized, code-split static assets into the `dist/` directory.

To start the production server:

```bash
npm start
```

In production mode, Express serves the static assets from `dist/` and handles all `/api/tmdb/*` proxy requests under the same origin.

---

## GitHub

To initialize a new Git repository and prepare your initial commit:

1. **Initialize Git**:
   ```bash
   git init
   ```

2. **Stage all tracked files**:
   ```bash
   git add .
   ```

3. **Create the initial commit**:
   ```bash
   git commit -m "Initial SOUMI project"
   ```

4. **Push to your GitHub repository**:
   Create a new empty repository on [GitHub](https://github.com/new) using your own account, then link and push:
   ```bash
   git remote add origin <your-github-repository-url>
   git branch -M main
   git push -u origin main
   ```

---

## Security Warning

> **CRITICAL SECURITY NOTICE**:
> **NEVER commit `.env` or your actual API keys to GitHub.**
>
> The `.gitignore` file is configured to exclude `.env`, `.env.*`, and build artifacts from source control. Always verify with `git status` that `.env` is ignored before committing.
>
> If an API key is accidentally committed or exposed in any public or private repository, it must be **revoked and rotated immediately** via the TMDb developer console.

---

## Deployment

SOUMI is built with a unified full-stack architecture combining a React SPA frontend with a Node.js Express backend proxy. The Express server serves both the optimized static frontend bundle (`dist/`) and all proxied TMDb API requests (`/api/tmdb/*`) under the same origin with server-side in-memory caching.

### Recommended Hosting Architecture

- **Optimal Match**: A **Node.js hosting platform** or **full-stack container platform** (e.g., Google Cloud Run, Render, Railway, Fly.io, Heroku, or a Linux VPS running PM2/Docker).
- **Why this architecture is best suited**: The server-side proxy securely manages the `TMDB_API_KEY` away from client browsers and provides 10-minute caching. Running the unified server eliminates CORS configuration issues, requires only a single deployment, and routes all client-side navigation (`*`) to `index.html`.
- **Static-only hosts (e.g. GitHub Pages)**: Not recommended without a separate backend, because static-only hosting cannot execute Node.js code or protect server-side API keys.

### Production Deployment Steps

Follow these steps when deploying SOUMI to your hosting provider:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure `TMDB_API_KEY` in hosting environment variables**:
   In your hosting provider dashboard, add the required environment variable:
   - `TMDB_API_KEY`: Your private TMDb API v3 authentication key
   - `NODE_ENV`: Set to `production`
   - `PORT`: (Optional) Automatically injected by most cloud providers (defaults to 3000)

3. **Build the application**:
   ```bash
   npm run build
   ```
   This generates the production client assets inside the `dist/` directory.

4. **Start the production server**:
   ```bash
   npm start
   ```
   This launches `server.ts` via `tsx`, serving static files and API proxy endpoints.

5. **Verify `/api/tmdb` requests**:
   Verify that server endpoints are responding properly:
   - Check the health check endpoint: `/api/health` (should return `{ "status": "ok", "tmdbConfigured": true }`).
   - Confirm proxied requests return data: `/api/tmdb/trending/movie/week?language=en-US`.

6. **Verify frontend routes**:
   Confirm that direct navigation to SPA routes works seamlessly:
   - Home: `/`
   - Movies catalog: `/movies`
   - TV Shows catalog: `/tv`
   - Search: `/search`
   - My List: `/my-list`
   - Movie details: `/movie/:id`
   - TV details: `/tv/:id`

---

## Legal

SOUMI is a movie and television discovery application designed for informational, educational, and catalog exploration purposes.

- This site does not host, stream, or distribute any copyrighted movies or video files.
- All movie and TV metadata, artwork, and posters are provided by [The Movie Database (TMDb)](https://www.themoviedb.org/).
- This product uses the TMDb API but is not endorsed or certified by TMDb.
- Video trailers are provided and embedded directly via YouTube.
