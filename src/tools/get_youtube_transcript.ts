import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  videoId: z.string().describe("The YouTube video ID (e.g., 'dQw4w9WgXcQ')"),
};

export const metadata = {
  name: "get_youtube_transcript",
  description: "Get the transcript for a YouTube video",
  annotations: {
    title: "Get YouTube Transcript",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_youtube_transcript({ videoId }: InferSchema<typeof schema>) {
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
    content: [
      {
        type: "text",
        text: transcript,
      },
    ],
  };
}
