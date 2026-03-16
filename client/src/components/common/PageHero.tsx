import { usePageBackground } from '../../hooks/usePageBackground';

interface Props {
  pageKey: string;
  fallbackImage?: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export default function PageHero({ pageKey, fallbackImage, children, className = 'page-hero', minHeight }: Props) {
  const { bg, backgroundImage, youtubeEmbed } = usePageBackground(pageKey);

  const hasVideo = !!youtubeEmbed;
  const bgStyle = backgroundImage || (fallbackImage
    ? `linear-gradient(rgba(0,0,0,${bg?.overlay_opacity ?? 0.55}),rgba(0,0,0,${bg?.overlay_opacity ?? 0.55})),url('${fallbackImage}')`
    : 'linear-gradient(135deg,#1b5e20,#2e7d32)');

  return (
    <section
      className={className}
      style={{
        backgroundImage: hasVideo ? undefined : bgStyle,
        position: 'relative',
        overflow: 'hidden',
        minHeight,
      }}
    >
      {/* YouTube autoplay video background */}
      {hasVideo && (
        <>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: `rgba(0,0,0,${bg?.overlay_opacity ?? 0.55})`,
          }} />
          <iframe
            src={youtubeEmbed}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '177.78vh', height: '100vh',
              minWidth: '100%', minHeight: '56.25vw',
              border: 'none', zIndex: -1, pointerEvents: 'none',
            }}
            allow="autoplay; encrypted-media"
            title="bg"
          />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {children}
      </div>
    </section>
  );
}
