import { Innertube } from "youtubei.js";

// Rotate between realistic user agents
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
];

// Add realistic headers
const getRandomHeaders = () => ({
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "DNT": "1",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Cache-Control": "max-age=0",
});

// Random delay to mimic human behavior
const randomDelay = (min: number = 500, max: number = 2000) => 
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

// Create a custom fetch function with proxy support
const createProxyFetch = () => {
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  
  if (!proxyUrl) {
    return undefined; // Use default fetch
  }

  console.error(`Using proxy: ${proxyUrl}`);
  
  return async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
    try {
      // Dynamically import the proxy agent
      const { HttpsProxyAgent } = await import("https-proxy-agent");
      const agent = new HttpsProxyAgent(proxyUrl);
      
      const fetchOptions: RequestInit = {
        ...options,
        // @ts-ignore - Node.js specific
        agent: url.toString().startsWith('https') ? agent : undefined,
        headers: {
          ...getRandomHeaders(),
          ...options?.headers,
        }
      };

      return fetch(url, fetchOptions);
    } catch (error) {
      console.error('Proxy fetch failed, falling back to regular fetch:', error);
      return fetch(url, {
        ...options,
        headers: {
          ...getRandomHeaders(),
          ...options?.headers,
        }
      });
    }
  };
};

export class YouTubeClient {
  private static instance: Innertube | null = null;
  private static lastRequestTime = 0;

  static async getInstance(): Promise<Innertube> {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 1000) {
      await randomDelay(1000 - timeSinceLastRequest, 2000);
    }
    this.lastRequestTime = Date.now();

    if (!this.instance) {
      await this.createInstance();
    }
    
    return this.instance!;
  }

  private static async createInstance(): Promise<void> {
    const userAgent = process.env.YT_USER_AGENT || 
      USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    
    const cookie = process.env.YT_COOKIE;
    const customFetch = createProxyFetch();

    console.error(`Creating Innertube instance with UA: ${userAgent.substring(0, 50)}...`);
    console.error(`Cookie present: ${!!cookie}`);
    console.error(`Proxy configured: ${!!process.env.HTTP_PROXY || !!process.env.HTTPS_PROXY}`);

    try {
      this.instance = await Innertube.create({
        generate_session_locally: true,
        user_agent: userAgent,
        ...(cookie ? { cookie } : {}),
        ...(customFetch ? { fetch: customFetch } : {}),
      });
    } catch (error) {
      console.error('Failed to create Innertube instance:', error);
      throw error;
    }
  }

  // Reset instance to force recreation with new settings
  static resetInstance(): void {
    this.instance = null;
  }

  // Retry wrapper for API calls
  static async withRetry<T>(
    operation: (client: Innertube) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.error(`API call attempt ${attempt}/${maxRetries}`);
        
        const client = await this.getInstance();
        const result = await operation(client);
        
        console.error(`API call successful on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`API call failed on attempt ${attempt}:`, error);

        if (attempt < maxRetries) {
          // Reset instance and wait before retry
          this.resetInstance();
          await randomDelay(2000 * attempt, 5000 * attempt);
        }
      }
    }

    throw lastError!;
  }
}

// Cache for responses to reduce API calls
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const withCache = <T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.error(`Cache hit for ${key}`);
    return Promise.resolve(cached.data);
  }

  return operation().then(result => {
    responseCache.set(key, { data: result, timestamp: Date.now() });
    console.error(`Cache set for ${key}`);
    return result;
  });
};
