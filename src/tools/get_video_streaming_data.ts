import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  videoId: z.string().describe("YouTube video ID"),
};

export const metadata = {
  name: "get_video_streaming_data",
  description: "Get available streaming formats and quality options for a YouTube video",
  annotations: {
    title: "Get Video Streaming Data",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_video_streaming_data({ videoId }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getInfo(videoId);
  const streamingData = info.streaming_data;
  if (!streamingData) {
    throw new Error("No streaming data available for this video");
  }
  const formats = [
    ...(streamingData.formats || []),
    ...(streamingData.adaptive_formats || []),
  ].map((format: any) => ({
    itag: format.itag,
    mimeType: format.mime_type,
    qualityLabel: format.quality_label,
    bitrate: format.bitrate,
    url: format.url,
    audioQuality: format.audio_quality,
    approxDurationMs: format.approx_duration_ms,
  }));
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(formats, null, 2),
      },
    ],
  };
}
