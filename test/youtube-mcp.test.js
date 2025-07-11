// Automated tests for YouTube MCP server
const fetch = require('node-fetch');

const MCP_URL = 'http://127.0.0.1:3002/mcp';

async function callTool(name, args = {}) {
  try {
    const body = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 100000),
      method: 'tools/call',
      params: { name, arguments: args }
    };
    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    return { error: { message: error.message } };
  }
}

async function run() {
  console.log('🧪 Testing YouTube MCP server...\n');
  
  // Check if server is running
  try {
    const healthCheck = await fetch(MCP_URL.replace('/mcp', ''));
    if (!healthCheck.ok) {
      console.error('❌ Server not responding. Make sure to start the dev server with: pnpm dev');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cannot connect to server. Make sure to start the dev server with: pnpm dev');
    console.error('   Expected server URL:', MCP_URL);
    process.exit(1);
  }

  let passed = 0, failed = 0;
  function check(name, ok, msg, resp) {
    if (ok) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.error(`❌ ${name}: ${msg}`);
      if (resp && resp.error) {
        console.error('  Error:', resp.error.message);
      } else if (resp) {
        console.error('  Response:', JSON.stringify(resp, null, 2));
      }
      failed++;
    }
  }

  // Test search_youtube
  const search = await callTool('search_youtube', { query: 'lofi hip hop', maxResults: 2 });
  let searchData = null;
  try {
    if (!search.error && search.result && search.result.content && search.result.content[0]) {
      searchData = JSON.parse(search.result.content[0].text);
    }
  } catch (e) {
    console.error('Parse error for search_youtube:', e.message);
  }
  check('search_youtube', Array.isArray(searchData), 'Should return an array', search);

  // Test get_youtube_transcript (may fail if video has no transcript)
  const transcript = await callTool('get_youtube_transcript', { videoId: 'dQw4w9WgXcQ' });
  check('get_youtube_transcript', 
    !transcript.error && transcript.result && transcript.result.content && transcript.result.content[0].text, 
    'Should return transcript text', transcript);

  // Test get_video_info
  const info = await callTool('get_video_info', { videoId: 'dQw4w9WgXcQ' });
  let infoObj = null;
  try { 
    if (!info.error && info.result && info.result.content) {
      infoObj = JSON.parse(info.result.content[0].text); 
    }
  } catch {}
  check('get_video_info', infoObj && (infoObj.videoId === 'dQw4w9WgXcQ' || infoObj.id === 'dQw4w9WgXcQ'), 'Should return correct video info', info);

  // Test get_channel_info
  const channel = await callTool('get_channel_info', { channelId: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ' });
  let channelObj = null;
  try { 
    if (!channel.error && channel.result && channel.result.content) {
      channelObj = JSON.parse(channel.result.content[0].text); 
    }
  } catch {}
  check('get_channel_info', channelObj && (channelObj.channelId === 'UC-9-kyTW8ZkZNDHQJ6FgpwQ' || channelObj.id === 'UC-9-kyTW8ZkZNDHQJ6FgpwQ'), 'Should return correct channel info', channel);

  // Test get_playlist_info
  const playlist = await callTool('get_playlist_info', { playlistId: 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI' });
  let playlistObj = null;
  try { playlistObj = JSON.parse(playlist.result.content[0].text); } catch {}
  check('get_playlist_info', playlistObj && playlistObj.id === 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', 'Should return correct playlist info', playlist);

  // Test get_channel_videos (using Visual Studio Code channel)
  const channelVideos = await callTool('get_channel_videos', { channelId: 'UCs5Y5_7XK8HLDX0SLNwkd3w', maxResults: 2 });
  let channelVideosArr = null;
  try { channelVideosArr = JSON.parse(channelVideos.result.content[0].text); } catch {}
  check('get_channel_videos', Array.isArray(channelVideosArr), 'Should return channel videos array', channelVideos);

  // Test get_video_comments
  const videoComments = await callTool('get_video_comments', { videoId: 'dQw4w9WgXcQ', maxResults: 2 });
  let videoCommentsArr = null;
  try { videoCommentsArr = JSON.parse(videoComments.result.content[0].text); } catch {}
  check('get_video_comments', Array.isArray(videoCommentsArr), 'Should return video comments array', videoComments);

  // Test search_channels
  const channelsSearch = await callTool('search_channels', { query: 'music', maxResults: 2 });
  let channelsSearchArr = null;
  try { channelsSearchArr = JSON.parse(channelsSearch.result.content[0].text); } catch {}
  check('search_channels', Array.isArray(channelsSearchArr), 'Should return channels search array', channelsSearch);

  // Test search_playlists
  const playlistsSearch = await callTool('search_playlists', { query: 'music', maxResults: 2 });
  let playlistsSearchArr = null;
  try { playlistsSearchArr = JSON.parse(playlistsSearch.result.content[0].text); } catch {}
  check('search_playlists', Array.isArray(playlistsSearchArr), 'Should return playlists search array', playlistsSearch);

  // Test get_trending_videos
  const trending = await callTool('get_trending_videos', { limit: 2 });
  let trendingArr = null;
  try { trendingArr = JSON.parse(trending.result.content[0].text); } catch {}
  check('get_trending_videos', Array.isArray(trendingArr), 'Should return trending videos array', trending);

  // Summary
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run();
