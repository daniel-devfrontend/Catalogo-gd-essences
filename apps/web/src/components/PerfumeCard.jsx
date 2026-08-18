import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui';

const isRealProductImage = (image) => {
  if (!image || typeof image !== 'string') return false;
  const normalized = image.trim();
  if (!normalized) return false;
  if (normalized.includes('placeholder.svg')) return false;
  return true;
};

const PerfumeCard = ({ perfume, onClick }) => {
  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(image)) {
      return image;
    }
    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, '')}`;
  };

  const primaryImage = Array.isArray(perfume.images)
    ? perfume.images.find((image) => isRealProductImage(image))
    : null;
  const imageSrc = primaryImage
    ? resolveImageSrc(primaryImage)
    : isRealProductImage(perfume.image)
      ? resolveImageSrc(perfume.image)
      : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className="group cursor-pointer h-full flex flex-col"
    >
      <div className="bg-card border border-border rounded-none overflow-hidden transition-all duration-300 hover:border-foreground/30 flex flex-col h-full">
        <div className="aspect-[4/5] overflow-hidden bg-muted relative">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={perfume.name}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs tracking-[0.2em] uppercase">
              Sin imagen
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm border-none rounded-none text-xs tracking-wider uppercase font-medium">
              {perfume.collection}
            </Badge>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-medium leading-tight mb-2 font-perfume-title">
            {perfume.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed flex-grow">
            {perfume.description}
          </p>
          <div className="mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${perfume.price.toFixed(2)}
              </span>
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                Descubrir
              </span>
            </div>
            {perfume.originalPrice ? (
              <p className="mt-2 text-xs font-semibold uppercase text-amber-400 tracking-[0.18em]">
                Original ${perfume.originalPrice.toFixed(2)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerfumeCard;