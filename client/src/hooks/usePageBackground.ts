import { useQuery } from '@tanstack/react-query';
import api from './useApi';
import type { PageBackground } from '../types';


export function usePageBackground(pageKey: string) {
  const { data } = useQuery<PageBackground[]>({
    queryKey: ['page-backgrounds'],
    queryFn: async () => {
      const r = await api.get('/page-backgrounds');
      return r.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const bg = data?.find(b => b.page_key === pageKey);

  // Build CSS backgroundImage string
  let backgroundImage = '';
  if (bg?.image_url) {
    const overlay = `rgba(0,0,0,${bg.overlay_opacity ?? 0.55})`;
    backgroundImage = `linear-gradient(${overlay},${overlay}),url('${bg.image_url}')`;
  }

  // YouTube embed URL for autoplay background video
  let youtubeEmbed = '';
  if (bg?.video_url) {
    const match = bg.video_url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (match) {
      youtubeEmbed = `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0&modestbranding=1`;
    }
  }

  return { bg, backgroundImage, youtubeEmbed };
}
