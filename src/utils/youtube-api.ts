// src/utils/youtube-api.ts
// Utility for making requests to the YouTube Data API v3
// Uses API key from environment variable YOUTUBE_API_KEY

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function youtubeApiRequest<T>(endpoint: string, params: Record<string, string | number>) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY environment variable is not set');
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  url.searchParams.append('key', apiKey);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}
