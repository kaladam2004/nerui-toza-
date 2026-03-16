export type VideoType = 'youtube' | 'vimeo' | 'video_file' | 'none';

export interface ParsedVideo {
  type: VideoType;
  embedUrl: string | null;
}

export function parseVideoUrl(url: string | null | undefined): ParsedVideo {
  if (!url) return { type: 'none', embedUrl: null };

  // YouTube formats:
  // https://www.youtube.com/watch?v=ID
  // https://youtu.be/ID
  // https://youtube.com/shorts/ID
  // https://www.youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  // Vimeo formats:
  // https://vimeo.com/123456789
  // https://player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Local video file or other direct URL
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return { type: 'video_file', embedUrl: url };
  }

  return { type: 'none', embedUrl: null };
}
