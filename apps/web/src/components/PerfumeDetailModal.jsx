import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Badge, Button } from '@/components/ui';
import { Check, MessageCircle, Phone } from 'lucide-react';
import { useSelection } from '@/context/SelectionContext';
import { resolveProductImage, isRealProductImage } from '@/lib/productImageResolver';

const PerfumeDetailModal = ({ perfume, isOpen, onClose }) => {
  const safePerfume = perfume || {};
  const productName = safePerfume.name || 'G&D Essences';
  const productPrice = Number(safePerfume.price ?? 0);
  const whatsappMessage = encodeURIComponent(`Hola, me interesa el perfume ${productName} ($${Number.isFinite(productPrice) ? productPrice.toFixed(2) : '0.00'}). ¿Podrían darme más información?`);
  const whatsappUrl = `https://wa.me/584246436776?text=${whatsappMessage}`;
  const { isSelected, toggleProduct } = useSelection();

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

  const galleryItems = React.useMemo(() => {
    const images = Array.isArray(safePerfume.images)
      ? safePerfume.images.filter(isRealProductImage)
      : [];

    const primaryImage = resolveProductImage(safePerfume);
    const validImages = images.length ? images : primaryImage ? [primaryImage] : [];

    const items = validImages.map((image) => ({
      type: 'image',
      src: resolveImageSrc(image),
    }));

    if (videoEmbedUrl) {
      items.push({
        type: 'video',
        src: videoThumbnailUrl || '',
        embedUrl: videoEmbedUrl,
      });
    }

    return items;
  }, [safePerfume, videoEmbedUrl, videoThumbnailUrl]);

  const activeItem = galleryItems[activeImage] || galleryItems[0];

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
          <div
            className="aspect-square md:aspect-auto md:h-full bg-muted relative touch-pan-y"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
            onTouchCancel={() => {
              touchStartXRef.current = null;
              touchEndXRef.current = null;
            }}
          >
            {activeItem && activeItem.type === 'video' && activeItem.embedUrl ? (
              <div className="relative h-full w-full bg-black">
                <iframe
                  src={activeItem.embedUrl}
                  title={`${productName} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                  style={{ border: 'none' }}
                />
              </div>
            ) : activeItem && activeItem.src ? (
              <img
                src={activeItem.src}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Sin imagen
              </div>
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
              <div className="mb-4 flex items-center justify-between gap-4">
                <Badge variant="outline" className="w-fit rounded-none text-xs tracking-widest uppercase border-border text-muted-foreground">
                  {perfume.collection}
                </Badge>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Consultar por WhatsApp"
                  aria-label={`Consultar ${productName} por WhatsApp`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <span className="relative flex h-6 w-6 items-center justify-center" aria-hidden="true">
                    <MessageCircle className="h-6 w-6" strokeWidth={1.7} />
                    <Phone className="absolute h-3 w-3 -rotate-12" strokeWidth={2} />
                  </span>
                </a>
              </div>
              <DialogTitle id="perfume-dialog-title" className="text-3xl md:text-4xl font-medium mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {productName}
              </DialogTitle>
              <div className="mt-4 flex items-center justify-between gap-4">
                <DialogDescription id="perfume-dialog-description" className="text-2xl text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${Number.isFinite(productPrice) ? productPrice.toFixed(2) : '0.00'}
                </DialogDescription>
              </div>
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
                variant="default"
                className="w-full rounded-none h-14 text-sm tracking-widest uppercase font-medium transition-all duration-300"
                onClick={() => toggleProduct(safePerfume)}
              >
                {isSelected(perfume.id) ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : null}
                {isSelected(perfume.id) ? 'Añadido a mi selección' : 'Añadir a mi selección'}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-none border-border text-foreground hover:bg-muted h-12 text-sm tracking-widest uppercase font-medium transition-all duration-300"
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