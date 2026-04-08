import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CollectionCard = ({ collection, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Link
        to={`/coleccion/${collection.id}`}
        className="block group h-full"
      >
        <div className="bg-card h-full p-8 border border-border transition-all duration-300 hover:border-foreground/40 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-2xl font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
              {collection.title}
            </h3>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
          </div>
          
          <p className="text-sm leading-relaxed text-muted-foreground mb-8 flex-grow">
            {collection.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              {collection.count || 0} {collection.count === 1 ? 'Fragancia' : 'Fragancias'}
            </span>
            <span className="text-xs font-medium tracking-widest uppercase text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Explorar
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CollectionCard;