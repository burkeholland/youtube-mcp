# Anti-Detection Configuration for YouTube MCP Server

This document outlines configuration options to bypass YouTube's blocking of requests from cloud hosting providers like Vercel.

## Environment Variables

### Basic Configuration
- `YT_USER_AGENT`: Custom user agent string (optional, rotates automatically if not set)
- `YT_COOKIE`: YouTube session cookie (optional, can help with rate limiting)

### Proxy Configuration
- `HTTP_PROXY`: HTTP proxy URL (e.g., `http://proxy.example.com:8080`)
- `HTTPS_PROXY`: HTTPS proxy URL (e.g., `https://proxy.example.com:8080`)

## Recommended Proxy Services

### Free/Low-cost Options
1. **ProxyMesh** - Rotating proxies specifically for web scraping
   - Plans start at $10/month for 10 ports
   - Endpoint: `http://us-wa.proxymesh.com:31280`

2. **ScraperAPI** - Has a free tier
   - 5,000 requests/month free
   - Endpoint format: `http://scraperapi:API_KEY@proxy-server.scraperapi.com:8001`

3. **Bright Data (formerly Luminati)** - Professional grade
   - Residential and datacenter proxies
   - More expensive but very reliable

### Example Environment Variable Setup

For Vercel deployment, add these environment variables:

```bash
# Basic anti-detection
YT_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Proxy configuration (replace with your proxy)
HTTP_PROXY="http://username:password@proxy.example.com:8080"
HTTPS_PROXY="http://username:password@proxy.example.com:8080"

# Optional: YouTube session cookie
YT_COOKIE="your_youtube_session_cookie_here"
```

## Features Implemented

1. **User Agent Rotation**: Automatically rotates between realistic browser user agents
2. **Realistic Headers**: Adds browser-like headers (Accept, Accept-Language, etc.)
3. **Request Timing**: Random delays between requests to mimic human behavior
4. **Proxy Support**: HTTP/HTTPS proxy support with fallback to direct requests
5. **Retry Logic**: Automatic retry with different configurations on failure
6. **Response Caching**: 5-minute cache to reduce API calls
7. **Error Handling**: Graceful fallback and detailed error logging

## Testing the Configuration

1. **Local Testing**: Test with `pnpm dev` to ensure everything works locally
2. **Proxy Testing**: Set proxy environment variables and test functionality
3. **Production Testing**: Deploy to Vercel and monitor logs for errors

## Monitoring and Debugging

The system logs detailed information to stderr:
- User agent being used
- Whether proxy is configured
- API call attempts and results
- Cache hits/misses
- Error details with stack traces

## Alternative Hosting Solutions

If Vercel continues to be blocked, consider:
1. **Railway** - Often has different IP ranges
2. **Fly.io** - Global edge deployment
3. **DigitalOcean App Platform** - Different datacenter IPs
4. **AWS Lambda** with **API Gateway** - Vast IP pool
5. **Google Cloud Run** - Different provider entirely

## Legal and Ethical Considerations

- Respect YouTube's Terms of Service
- Implement reasonable rate limiting
- Don't overload YouTube's servers
- Consider using official YouTube Data API for production applications
- Proxies should be used responsibly and in compliance with their terms
