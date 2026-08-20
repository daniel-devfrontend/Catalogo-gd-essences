import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CollectionCard = ({ collection, index }) => {
  const imageSrc = collection.image
    ? /^(?:https?:|data:|blob:)/i.test(collection.image)
      ? collection.image
      : `${import.meta.env.BASE_URL}${collection.image.replace(/^\/+/, '')}`
    : `${import.meta.env.BASE_URL}Logos/LogoApp2-catalogo-512.png`;

  return (
    <div className="h-full">
      <Link
        to={`/coleccion/${collection.id}`}
        state={{ collectionImage: imageSrc }}
        className="block group h-full"
      >
          <div className="relative h-full min-h-[230px] overflow-hidden border border-border bg-card transition-all duration-300 group-hover:border-foreground/60">
            <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
            <div className="relative flex h-full flex-col justify-end p-5 text-white sm:p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-medium leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {collection.title.replace(/^Colección\s+/i, '')}
                  </h3>
                  {collection.description && (
                    <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80">
                      {collection.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/75">
                    Ver colección
                  </p>
                </div>
                <ArrowRight className="mb-1 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
      </Link>
    </div>
  );
};

export default CollectionCard;