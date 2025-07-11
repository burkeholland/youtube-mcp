# Technical Specification: YouTube MCP SaaS Frontend

## Overview
This document outlines the technical specification for the frontend of the YouTube MCP SaaS product. The frontend will provide user account management, API key generation, usage tracking, and billing information. Users will be able to sign up, manage their accounts, and obtain an API key for accessing the MCP server. The frontend will use Supabase for authentication and database services.

## User Account Management
- **Sign-up**: Users can create a new account using email/password or social providers via Supabase Auth.
- **Log-in**: Authenticate users with Supabase Auth.
- **Account Page**: A dedicated page where users can manage their account details, view their current plan, and see their usage.
- **API Key Management**: Users can view, copy, and regenerate their API key from their account page.

## API Design

### Usage Tracking
- **Endpoint**: `/usage`
- **Method**: GET
- **Description**: Returns API usage and quotas for the authenticated account.

### Billing
- **Webhook**: `/billing/webhook`
- **Description**: Handles Stripe events for subscription management.

## Tech Stack & Dependencies
- **Framework**: Next.js (or similar React framework)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Deployment on Vercel

### Overview
The application will be deployed on Vercel, leveraging its serverless architecture for scalability and cost efficiency. Vercel's edge network ensures low-latency responses for global users.

### Key Adjustments for Vercel
1. **Serverless Functions**:
   - Each tool will be implemented as a serverless function.
   - Ensure tools are stateless and optimize cold start times.

2. **Environment Variables**:
   - Store sensitive data (e.g., JWT secret, Stripe API key) in Vercel's environment variable settings.
   - Use Vercel's `vercel env` CLI to manage these variables securely.

3. **Rate Limiting**:
   - Implement rate limiting at the function level using in-memory solutions like `lru-cache` or external services like Redis (via Upstash for serverless compatibility).

4. **Usage Tracking**:
   - Use Supabase (PostgreSQL) for tracking API usage.
   - Ensure database connections are optimized for serverless environments (e.g., connection pooling via Prisma or pgBouncer).

5. **Static Assets**:
   - Host static assets (e.g., documentation, OpenAPI specs) directly on Vercel's CDN.

6. **Observability**:
   - Use Vercel's built-in analytics for monitoring function invocations and performance.
   - Integrate with external logging services like Logflare or Datadog for detailed observability.

### Implementation Steps
1. Set up a Next.js application with Vercel.
2. Integrate Supabase for authentication and user management.
3. Build account management pages for users to view plan details and manage API keys.
4. Refactor tools to be deployed as individual serverless functions.
5. Configure environment variables in Vercel for secure storage.
6. Optimize database connections for serverless compatibility.
7. Set up rate limiting and usage tracking mechanisms.
8. Deploy static assets and API documentation to Vercel's CDN.
9. Monitor performance and usage using Vercel's analytics and external logging tools.

## Business Model

### Free Tier
- **Purpose**: Attract users and showcase the value of the product.
- **Features**:
  - Access to basic tools (e.g., `get_home_feed`, `search_youtube`).
  - Limited API requests (e.g., 100 requests/month).
  - Rate-limited access (e.g., 1 request/second).
  - No access to advanced features like usage tracking or billing integration.
  - Community support only (no dedicated support).
- **Goal**: Provide just enough functionality to demonstrate the product's potential but limit usage to encourage upgrading.

### Paid Tier
- **Purpose**: Enable users to perform meaningful work within a capped limit.
- **Features**:
  - Higher API request cap (e.g., 10,000 requests/month).
  - Faster rate limits (e.g., 10 requests/second).
  - Access to advanced tools (e.g., `get_video_info`, `get_youtube_transcript`).
  - Usage tracking and analytics dashboard.
  - Priority support.
- **Pricing**: Flat monthly fee (e.g., $29/month).

### Key Considerations
1. **Free Tier Limitations**: Ensure the free tier is useful but not sufficient for heavy or professional use. For example:
   - Limit the number of results returned by tools (e.g., max 5 results per query).
   - Restrict access to certain tools or features.
2. **Upgrade Incentives**: Highlight the benefits of the paid tier, such as higher limits, advanced tools, and better support.
3. **Capped Usage**: For now, do not allow users to purchase additional requests beyond their plan's cap. Clearly communicate this limitation to users.
