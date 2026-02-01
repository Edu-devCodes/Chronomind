import ytdl from "@distube/ytdl-core";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function downloadYoutubeAudio(videoId) {
  const tmpDir = path.resolve("tmp");

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  const outputPath = path.join(tmpDir, `${videoId}.mp3`);

  return new Promise((resolve, reject) => {
    const stream = ytdl(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25, // MUITO importante no Render
      }
    );

    ffmpeg(stream)
      .audioBitrate(128)
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err));
  });
}
