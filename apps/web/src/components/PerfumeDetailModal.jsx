import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Badge, Button } from '@/components/ui';
import { Link } from 'react-router-dom';

const isRealProductImage = (image) => {
  if (!image || typeof image !== 'string') return false;
  const normalized = image.trim();
  if (!normalized) return false;
  if (normalized.includes('placeholder.svg')) return false;
  return true;
};

const PerfumeDetailModal = ({ perfume, isOpen, onClose }) => {
  const safePerfume = perfume || {};
  const productName = safePerfume.name || 'G&D Essences';
  const productPrice = Number(safePerfume.price ?? 0);

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

  const getProductPlaceholder = (name) => {
    const initials = (name || 'G&D')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || 'G&D';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#f4efe8"/>
            <stop offset="100%" stop-color="#e8dcc4"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="1500" fill="url(#bg)"/>
        <rect x="80" y="80" width="1040" height="1340" rx="34" fill="#ffffff" stroke="#d6c3a0" stroke-width="8"/>
        <circle cx="600" cy="560" r="220" fill="#efe2cf"/>
        <path d="M600 380c-120 110-170 190-170 280 0 120 76 230 170 230s170-110 170-230c0-90-50-170-170-280Z" fill="#2f241d"/>
        <path d="M470 820h260" stroke="#8b6b3f" stroke-width="14" stroke-linecap="round"/>
        <text x="600" y="1030" text-anchor="middle" font-size="160" font-family="Georgia, serif" fill="#2f241d" letter-spacing="12">${initials}</text>
        <text x="600" y="1200" text-anchor="middle" font-size="62" font-family="Georgia, serif" fill="#2f241d">${(name || 'G&D Essences').slice(0, 16)}</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const videoId = getYoutubeVideoId(safePerfume.video_url || safePerfume.videoUrl || '');
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
    const images = Array.isArray(safePerfume.images)
      ? safePerfume.images.filter(isRealProductImage)
      : [];

    const primaryImage = isRealProductImage(safePerfume.image) ? safePerfume.image : null;
    const validImages = images.length ? images : primaryImage ? [primaryImage] : [];

    const items = validImages.map((image) => ({
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
  }, [safePerfume, videoEmbedUrl, videoThumbnailUrl]);

  const activeItem = galleryItems[activeImage] || galleryItems[0];

  const handleGalleryImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = getProductPlaceholder(perfume?.name || 'G&D Essences');
  };

  if (!isOpen || !perfume || !safePerfume.id) {
    return null;
  }

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
                  title={`${productName} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                  style={{ border: 'none' }}
                />
              </div>
            ) : (
              <img
                src={activeItem.src}
                alt={productName}
                onError={handleGalleryImageError}
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
                {productName}
              </DialogTitle>
              <DialogDescription id="perfume-dialog-description" className="text-2xl text-foreground mt-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${Number.isFinite(productPrice) ? productPrice.toFixed(2) : '0.00'}
              </DialogDescription>
            </DialogHeader>

            <div className="mb-10">
              <p className="text-base leading-relaxed text-muted-foreground">
                {safePerfume.description}
              </p>
              {safePerfume.originalPrice ? (
                <p className="mt-4 text-sm font-semibold text-amber-300">
                  También disponible en su versión original por ${Number(safePerfume.originalPrice).toFixed(2)}
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