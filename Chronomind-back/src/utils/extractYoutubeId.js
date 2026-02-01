// utils/extractYoutubeId.js
export function extractYoutubeId(url) {
  const match = url.match(
    /(?:v=|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
