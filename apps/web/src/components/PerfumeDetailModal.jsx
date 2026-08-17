import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Badge, Button } from '@/components/ui';
import { Link } from 'react-router-dom';

const PerfumeDetailModal = ({ perfume, isOpen, onClose }) => {
  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(image)) {
      return image;
    }
    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, '')}`;
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const normalized = url.trim();
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i,
      /youtube\.com\/embed\/([\w-]+)/i,
      /youtube\.com\/shorts\/([\w-]+)/i,
      /youtube\.com\/v\/([\w-]+)/i,
      /^([\w-]{11})$/i,
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const getYoutubeEmbedUrl = (id) => {
    if (!id) return '';
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1&iv_load_policy=3&disablekb=1&playsinline=1`;
  };
  const getYoutubeThumbnailUrl = (id) => (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '');

  const videoId = getYoutubeVideoId(perfume.video_url || perfume.videoUrl || '');
  const videoEmbedUrl = getYoutubeEmbedUrl(videoId);
  const videoThumbnailUrl = getYoutubeThumbnailUrl(videoId);

  const [activeImage, setActiveImage] = React.useState(0);
  const touchStartXRef = React.useRef(null);
  const touchEndXRef = React.useRef(null);

  const handleSwipeStart = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    touchStartXRef.current = clientX;
  };

  const handleSwipeEnd = (event) => {
    const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    touchEndXRef.current = clientX;
    if (touchStartXRef.current === null) return;
    const deltaX = clientX - touchStartXRef.current;
    const threshold = 48;
    if (deltaX > threshold) {
      setActiveImage((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    } else if (deltaX < -threshold) {
      setActiveImage((prev) => (prev + 1) % galleryItems.length);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  React.useEffect(() => {
    setActiveImage(0);
  }, [perfume?.id]);

  const handlePointerDown = (event) => {
    touchStartXRef.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (touchStartXRef.current === null) return;
    const deltaX = event.clientX - touchStartXRef.current;
    const threshold = 48;
    if (deltaX > threshold) {
      setActiveImage((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    } else if (deltaX < -threshold) {
      setActiveImage((prev) => (prev + 1) % galleryItems.length);
    }
    touchStartXRef.current = null;
  };

  const galleryItems = React.useMemo(() => {
    const images = Array.isArray(perfume.images) && perfume.images.length
      ? perfume.images
      : [perfume.image];

    const items = images.filter(Boolean).map((image) => ({
      type: 'image',
      src: resolveImageSrc(image),
    }));

    if (videoEmbedUrl) {
      items.push({
        type: 'video',
        src: videoThumbnailUrl || `${import.meta.env.BASE_URL}perfumes/placeholder.svg`,
        embedUrl: videoEmbedUrl,
      });
    }

    return items.length ? items : [{ type: 'image', src: `${import.meta.env.BASE_URL}perfumes/placeholder.svg` }];
  }, [perfume, videoEmbedUrl, videoThumbnailUrl]);

  const activeItem = galleryItems[activeImage] || galleryItems[0];

  if (!perfume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden bg-background border-border rounded-none"
        aria-labelledby="perfume-dialog-title"
        aria-describedby="perfume-dialog-description"
      >
        <div className="grid md:grid-cols-2 h-full">
          <div className="aspect-square md:aspect-auto md:h-full bg-muted relative">
            {activeItem.type === 'video' ? (
              <div
                className="relative h-full w-full bg-black"
                onTouchStart={handleSwipeStart}
                onTouchEnd={handleSwipeEnd}
                onPointerDown={handleSwipeStart}
                onPointerUp={handleSwipeEnd}
              >
                <iframe
                  src={activeItem.embedUrl}
                  title={`${perfume.name} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                  style={{ border: 'none' }}
                />
              </div>
            ) : (
              <img
                src={activeItem.src}
                alt={perfume.name}
                onError={(event) => {
                  event.currentTarget.src = `${import.meta.env.BASE_URL}perfumes/placeholder.svg`;
                }}
                className="w-full h-full object-cover"
              />
            )}

            {galleryItems.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImage((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((prev) => (prev + 1) % galleryItems.length)}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Siguiente"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center">
            <DialogHeader className="mb-8 text-left">
              <Badge variant="outline" className="w-fit mb-4 rounded-none text-xs tracking-widest uppercase border-border text-muted-foreground">
                {perfume.collection}
              </Badge>
              <DialogTitle id="perfume-dialog-title" className="text-3xl md:text-4xl font-medium mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {perfume.name}
              </DialogTitle>
              <DialogDescription id="perfume-dialog-description" className="text-2xl text-foreground mt-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${perfume.price.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="mb-10">
              <p className="text-base leading-relaxed text-muted-foreground">
                {perfume.description}
              </p>
              {perfume.originalPrice ? (
                <p className="mt-4 text-sm font-semibold text-amber-300">
                  También disponible en su versión original por ${perfume.originalPrice.toFixed(2)}
                </p>
              ) : null}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Button
                asChild
                variant="default"
                className="w-full rounded-none h-14 text-sm tracking-widest uppercase font-medium transition-all duration-300"
              >
                <Link to="/contacto">Contactar por este perfume</Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full rounded-none border-border text-foreground hover:bg-muted h-14 text-sm tracking-widest uppercase font-medium transition-all duration-300" 
                onClick={onClose}
              >
                Volver
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerfumeDetailModal;