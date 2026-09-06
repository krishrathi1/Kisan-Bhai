# Vercel Deployment

BeejMantra is already compatible with Vercel as a Next.js app.

## Required environment variables

Set these in the Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=profile-images
GOOGLE_API_KEY=your-google-api-key
# Optional compatibility alias
GOOGLE_GENAI_API_KEY=your-google-genai-api-key
MARKET_DATA_API_KEY=your-market-data-key
WEATHER_API_KEY=your-weather-api-key
```

If you use Google OAuth with Supabase, add these redirect URLs in Supabase Auth:

```text
http://localhost:9002/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

## Deploy

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables above.
4. Deploy.

## Notes

- The app is a standard Next.js App Router project, so Vercel will detect it automatically.
- `vercel.json` is included only to make the framework explicit.
- Make sure your Supabase tables and storage policies are applied before production traffic hits the app.
