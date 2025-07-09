import { Innertube } from "youtubei.js";
import * as readline from "readline";

// MCP resource response type
interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  text: string;
}

// MCP request types
interface MCPReadRequest {
  method: "resources/read";
  params: {
    uri: string;
  };
}

interface MCPReadResponse {
  contents: MCPResource[];
}

// Helper to parse videoId from URI
function parseVideoIdFromUri(uri: string): string | null {
  // Expecting uri like: youtube://transcript/VIDEO_ID
  const match = uri.match(/^youtube:\/\/transcript\/(.+)$/);
  return match ? match[1] : null;
}

// Search YouTube for videos
async function searchYouTube(query: string, maxResults: number = 10): Promise<any[]> {
  const yt = await Innertube.create({ generate_session_locally: true });
  const search = await yt.search(query, { type: 'video' });
  const videos = search.results
    .filter((item: any) => item.type === "video")
    .slice(0, maxResults)
    .map((video: any) => ({
      videoId: video.id,
      title: video.title,
      channel: video.author?.name,
      duration: video.duration,
      views: video.view_count,
      publishedTime: video.published,
      thumbnail: video.thumbnails?.[0]?.url || '',
      url: `https://www.youtube.com/watch?v=${video.id}`
    }));
  return videos;
}

// --- New tool implementations ---
async function getVideoInfo(videoId: string) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getInfo(videoId);
  return {
    videoId,
    title: info.basic_info.title,
    description: info.basic_info.short_description,
    author: info.basic_info.author,
    channelId: info.basic_info.channel_id,
    viewCount: info.basic_info.view_count,
    likeCount: info.basic_info.like_count,
    // publishDate: info.basic_info.publish_date or info.basic_info.published, neither exists; omit for now
    duration: info.basic_info.duration,
    thumbnails: info.basic_info.thumbnail,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

async function getVideoComments(videoId: string, limit: number = 10) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const comments = await yt.getComments(videoId);
  return comments.contents.slice(0, limit).map((comment: any) => ({
    commentId: comment.comment_id,
    author: comment.author?.name,
    text: comment.content,
    published: comment.published,
    likes: comment.likes,
  }));
}

async function getVideoStreamingData(videoId: string) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getInfo(videoId);
  return info.streaming_data;
}

async function getChannelInfo(channelId: string) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const channel = await yt.getChannel(channelId);
  return {
    channelId,
    title: channel.metadata?.title ?? null,
    description: channel.metadata?.description ?? null,
    url: `https://www.youtube.com/channel/${channelId}`,
    author: channel.metadata?.title ?? null,
    thumbnails: channel.metadata?.thumbnail ?? [],
  };
}

async function getChannelVideos(channelId: string, limit: number = 10) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const channel = await yt.getChannel(channelId);
  return channel.videos?.slice(0, limit).map((video: any) => ({
    videoId: video.id,
    title: video.title,
    duration: video.duration,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnails: video.thumbnails,
  })) ?? [];
}

async function searchChannels(query: string, limit: number = 10) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const search = await yt.search(query, { type: "channel" });
  return search.results
    .filter((item: any) => item.type === "channel")
    .slice(0, limit)
    .map((channel: any) => ({
      channelId: channel.id,
      title: channel.title,
      url: `https://www.youtube.com/channel/${channel.id}`,
      thumbnails: channel.thumbnails,
    }));
}

async function getPlaylistInfo(playlistId: string) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const playlist = await yt.getPlaylist(playlistId);
  return {
    id: playlistId,
    title: playlist.info?.title ?? null,
    description: playlist.info?.description ?? null,
    videoCount: playlist.info?.total_items ?? null,
    views: playlist.info?.views ?? null,
    lastUpdated: playlist.info?.last_updated ?? null,
    privacy: playlist.info?.privacy ?? null,
    url: `https://www.youtube.com/playlist?list=${playlistId}`,
    author: playlist.info?.author?.name ?? null,
    videos: playlist.videos?.map((video: any) => ({
      videoId: video.id,
      title: video.title,
      duration: video.duration,
      url: `https://www.youtube.com/watch?v=${video.id}`,
    })) ?? [],
  };
}

async function searchPlaylists(query: string, limit: number = 10) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const search = await yt.search(query, { type: "playlist" });
  return search.results
    .filter((item: any) => item.type === "playlist")
    .slice(0, limit)
    .map((playlist: any) => ({
      playlistId: playlist.id,
      title: playlist.title,
      author: playlist.author?.name,
      videoCount: playlist.video_count,
      url: `https://www.youtube.com/playlist?list=${playlist.id}`,
      thumbnails: playlist.thumbnails,
    }));
}

async function getSearchSuggestions(query: string) {
  const yt = await Innertube.create({ generate_session_locally: true });
  return await yt.getSearchSuggestions(query);
}

async function searchWithFilters(query: string, type?: string, limit: number = 10) {
  const yt = await Innertube.create({ generate_session_locally: true });
  // Only pass type if it matches allowed values
  const allowedTypes = ["video", "channel", "playlist", "movie"];
  // youtubei.js expects type as a specific string literal type, so cast as any
  const filters = type && allowedTypes.includes(type) ? { type: type as any } : {};
  const search = await yt.search(query, filters);
  return search.results.slice(0, limit).map((item: any) => {
    if (item.type === "video") {
      return {
        type: "video",
        videoId: item.id,
        title: item.title,
        author: item.author?.name,
        duration: item.duration,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnails: item.thumbnails,
      };
    } else if (item.type === "channel") {
      return {
        type: "channel",
        channelId: item.id,
        title: item.title,
        url: `https://www.youtube.com/channel/${item.id}`,
        thumbnails: item.thumbnails,
      };
    } else if (item.type === "playlist") {
      return {
        type: "playlist",
        playlistId: item.id,
        title: item.title,
        author: item.author?.name,
        videoCount: item.video_count,
        url: `https://www.youtube.com/playlist?list=${item.id}`,
        thumbnails: item.thumbnails,
      };
    } else if (item.type === "movie") {
      return {
        type: "movie",
        movieId: item.id,
        title: item.title,
        url: item.url,
        thumbnails: item.thumbnails,
      };
    }
    return null;
  }).filter(Boolean);
}

async function getTrendingVideos(limit: number = 10) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const trending = await yt.getTrending();
  return trending.videos?.slice(0, limit).map((video: any) => ({
    videoId: video.id,
    title: video.title,
    author: video.author?.name,
    duration: video.duration,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnails: video.thumbnails,
  })) ?? [];
}

async function getHomeFeed(limit: number = 10) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const home = await yt.getHomeFeed();
  return home.videos?.slice(0, limit).map((video: any) => ({
    videoId: video.id,
    title: video.title,
    author: video.author?.name,
    duration: video.duration,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnails: video.thumbnails,
  })) ?? [];
}

// Fetch transcript using Innertube
async function fetchTranscript(videoId: string): Promise<MCPResource> {
  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getInfo(videoId);
  const transcriptInfo = await info.getTranscript();
  if (!transcriptInfo || !transcriptInfo.transcript || !transcriptInfo.transcript.content || !transcriptInfo.transcript.content.body) {
    throw new Error("No transcript available for this video");
  }
  const segments = transcriptInfo.transcript.content.body.initial_segments;
  const items = segments.map((segment: any) => segment.snippet.text);
  const transcript = items.join(" ");
  return {
    uri: `youtube://transcript/${videoId}`,
    name: `Transcript for ${videoId}`,
    description: info.basic_info.title || `YouTube transcript for video ${videoId}`,
    mimeType: "text/plain",
    text: transcript,
  };
}


// Redirect all logs to stderr
console.log = console.error;

// Minimal MCP server: read from stdin, write to stdout
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

process.stdin.on("data", async (data) => {
  try {
    const req = JSON.parse(data.toString());
    // Handle initialize method
    if (req.method === "initialize") {
      // Respond with capabilities (minimal example)
      const response = {
        jsonrpc: "2.0",
        id: req.id,
        result: {
          capabilities: {
            resources: {
              subscribe: false,
              listChanged: false
            },
            tools: {
              listChanged: false
            }
          }
        }
      };
      process.stdout.write(JSON.stringify(response) + "\n");
      return;
    }
    
    // Handle notifications/initialized method (no response needed)
    if (req.method === "notifications/initialized") {
      return;
    }
    if (req.method === "resources/read") {
      const videoId = parseVideoIdFromUri(req.params.uri);
      if (!videoId) {
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Invalid resource URI" } }) + "\n");
        return;
      }
      try {
        const resource = await fetchTranscript(videoId);
        const response: MCPReadResponse = { contents: [resource] };
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: response }) + "\n");
      } catch (err: any) {
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
      }
    } else if (req.method === "resources/list") {
      // Return available resource templates
      const response = {
        jsonrpc: "2.0",
        id: req.id,
        result: {
          resources: [
            {
              uri: "youtube://transcript/{videoId}",
              name: "YouTube Transcript",
              description: "Get transcript for a YouTube video by video ID",
              mimeType: "text/plain"
            }
          ]
        }
      };
      process.stdout.write(JSON.stringify(response) + "\n");
    } else if (req.method === "tools/list") {
      // Return available tools
      const response = {
        jsonrpc: "2.0",
        id: req.id,
        result: {
          tools: [
            {
              name: "get_youtube_transcript",
              description: "Get the transcript for a YouTube video",
              inputSchema: {
                type: "object",
                properties: {
                  videoId: { type: "string", description: "The YouTube video ID (e.g., 'dQw4w9WgXcQ')" }
                },
                required: ["videoId"]
              }
            },
            {
              name: "search_youtube",
              description: "Search YouTube for videos",
              inputSchema: {
                type: "object",
                properties: {
                  query: { type: "string", description: "The search query to find videos" },
                  maxResults: { type: "number", description: "Maximum number of results to return (default: 10, max: 50)", minimum: 1, maximum: 50 }
                },
                required: ["query"]
              }
            },
            { name: "get_video_info", description: "Get info for a YouTube video", inputSchema: { type: "object", properties: { videoId: { type: "string", description: "The YouTube video ID" } }, required: ["videoId"] } },
            { name: "get_video_comments", description: "Get comments for a YouTube video", inputSchema: { type: "object", properties: { videoId: { type: "string", description: "The YouTube video ID" }, limit: { type: "number", description: "Max comments", minimum: 1, maximum: 50 } }, required: ["videoId"] } },
            { name: "get_video_streaming_data", description: "Get streaming data for a YouTube video", inputSchema: { type: "object", properties: { videoId: { type: "string", description: "The YouTube video ID" } }, required: ["videoId"] } },
            { name: "get_channel_info", description: "Get info for a YouTube channel", inputSchema: { type: "object", properties: { channelId: { type: "string", description: "The YouTube channel ID" } }, required: ["channelId"] } },
            { name: "get_channel_videos", description: "Get videos for a YouTube channel", inputSchema: { type: "object", properties: { channelId: { type: "string", description: "The YouTube channel ID" }, limit: { type: "number", description: "Max videos", minimum: 1, maximum: 50 } }, required: ["channelId"] } },
            { name: "search_channels", description: "Search for YouTube channels", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query" }, limit: { type: "number", description: "Max channels", minimum: 1, maximum: 50 } }, required: ["query"] } },
            { name: "get_playlist_info", description: "Get info for a YouTube playlist", inputSchema: { type: "object", properties: { playlistId: { type: "string", description: "The YouTube playlist ID" } }, required: ["playlistId"] } },
            { name: "search_playlists", description: "Search for YouTube playlists", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query" }, limit: { type: "number", description: "Max playlists", minimum: 1, maximum: 50 } }, required: ["query"] } },
            { name: "get_search_suggestions", description: "Get YouTube search suggestions", inputSchema: { type: "object", properties: { query: { type: "string", description: "Partial search query" } }, required: ["query"] } },
            { name: "search_with_filters", description: "Search YouTube with filters", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query" }, type: { type: "string", description: "Type filter (video, channel, playlist, movie)" }, limit: { type: "number", description: "Max results", minimum: 1, maximum: 50 } }, required: ["query"] } },
            { name: "get_trending_videos", description: "Get trending YouTube videos", inputSchema: { type: "object", properties: { limit: { type: "number", description: "Max videos", minimum: 1, maximum: 50 } } } },
            { name: "get_home_feed", description: "Get YouTube home feed", inputSchema: { type: "object", properties: { limit: { type: "number", description: "Max videos", minimum: 1, maximum: 50 } } } },
          ]
        }
      };
      process.stdout.write(JSON.stringify(response) + "\n");
    } else if (req.method === "tools/call") {
      if (req.params.name === "get_youtube_transcript") {
        const videoId = req.params.arguments?.videoId;
        if (!videoId) {
          process.stdout.write(JSON.stringify({ 
            jsonrpc: "2.0", 
            id: req.id, 
            error: { code: -32602, message: "Missing required parameter: videoId" } 
          }) + "\n");
          return;
        }
        try {
          const resource = await fetchTranscript(videoId);
          const response = {
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [
                {
                  type: "text",
                  text: resource.text
                }
              ]
            }
          };
          process.stdout.write(JSON.stringify(response) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ 
            jsonrpc: "2.0", 
            id: req.id, 
            error: { code: -32000, message: err.message } 
          }) + "\n");
        }
      } else if (req.params.name === "search_youtube") {
        const query = req.params.arguments?.query;
        const maxResults = req.params.arguments?.maxResults || 10;
        
        if (!query) {
          process.stdout.write(JSON.stringify({ 
            jsonrpc: "2.0", 
            id: req.id, 
            error: { code: -32602, message: "Missing required parameter: query" } 
          }) + "\n");
          return;
        }
        
        try {
          const videos = await searchYouTube(query, maxResults);
          const response = {
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(videos, null, 2)
                }
              ]
            }
          };
          process.stdout.write(JSON.stringify(response) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ 
            jsonrpc: "2.0", 
            id: req.id, 
            error: { code: -32000, message: err.message } 
          }) + "\n");
        }
      } else if (req.params.name === "get_video_info") {
        const videoId = req.params.arguments?.videoId;
        if (!videoId) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: videoId" } }) + "\n");
          return;
        }
        try {
          const info = await getVideoInfo(videoId);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_video_comments") {
        const videoId = req.params.arguments?.videoId;
        const limit = req.params.arguments?.limit || 10;
        if (!videoId) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: videoId" } }) + "\n");
          return;
        }
        try {
          const comments = await getVideoComments(videoId, limit);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(comments, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_video_streaming_data") {
        const videoId = req.params.arguments?.videoId;
        if (!videoId) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: videoId" } }) + "\n");
          return;
        }
        try {
          const data = await getVideoStreamingData(videoId);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_channel_info") {
        const channelId = req.params.arguments?.channelId;
        if (!channelId) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: channelId" } }) + "\n");
          return;
        }
        try {
          const info = await getChannelInfo(channelId);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_channel_videos") {
        const channelId = req.params.arguments?.channelId;
        const limit = req.params.arguments?.limit || 10;
        if (!channelId) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: channelId" } }) + "\n");
          return;
        }
        try {
          const videos = await getChannelVideos(channelId, limit);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(videos, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "search_channels") {
        const query = req.params.arguments?.query;
        const limit = req.params.arguments?.limit || 10;
        if (!query) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: query" } }) + "\n");
          return;
        }
        try {
          const channels = await searchChannels(query, limit);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(channels, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_playlist_info") {
        const playlistId = req.params.arguments?.playlistId;
        if (!playlistId) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: playlistId" } }) + "\n");
          return;
        }
        try {
          const info = await getPlaylistInfo(playlistId);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "search_playlists") {
        const query = req.params.arguments?.query;
        const limit = req.params.arguments?.limit || 10;
        if (!query) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: query" } }) + "\n");
          return;
        }
        try {
          const playlists = await searchPlaylists(query, limit);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(playlists, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_search_suggestions") {
        const query = req.params.arguments?.query;
        if (!query) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: query" } }) + "\n");
          return;
        }
        try {
          const suggestions = await getSearchSuggestions(query);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(suggestions, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "search_with_filters") {
        const query = req.params.arguments?.query;
        const type = req.params.arguments?.type;
        const limit = req.params.arguments?.limit || 10;
        if (!query) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32602, message: "Missing required parameter: query" } }) + "\n");
          return;
        }
        try {
          const results = await searchWithFilters(query, type, limit);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_trending_videos") {
        const limit = req.params.arguments?.limit || 10;
        try {
          const videos = await getTrendingVideos(limit);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(videos, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else if (req.params.name === "get_home_feed") {
        const limit = req.params.arguments?.limit || 10;
        try {
          const videos = await getHomeFeed(limit);
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { content: [{ type: "text", text: JSON.stringify(videos, null, 2) }] } }) + "\n");
        } catch (err: any) {
          process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32000, message: err.message } }) + "\n");
        }
      } else {
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32601, message: "Unknown tool" } }) + "\n");
      }
    } else {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, error: { code: -32601, message: "Unsupported method" } }) + "\n");
    }
  } catch (err: any) {
    // Malformed request
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Malformed request" } }) + "\n");
  }
});

console.error("MCP YouTube Transcript server started. Waiting for requests on stdin...");
