import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Badge, Button } from '@/components/ui';
import { Link } from 'react-router-dom';

const PerfumeDetailModal = ({ perfume, isOpen, onClose }) => {
  if (!perfume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border rounded-none">
        <div className="grid md:grid-cols-2 h-full">
          <div className="aspect-square md:aspect-auto md:h-full bg-muted relative">
            <img
              src={perfume.image}
              alt={perfume.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center">
            <DialogHeader className="mb-8 text-left">
              <Badge variant="outline" className="w-fit mb-4 rounded-none text-xs tracking-widest uppercase border-border text-muted-foreground">
                {perfume.collection}
              </Badge>
              <DialogTitle className="text-3xl md:text-4xl font-medium mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {perfume.name}
              </DialogTitle>
              <DialogDescription className="text-2xl text-foreground mt-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${perfume.price.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="mb-10">
              <p className="text-base leading-relaxed text-muted-foreground">
                {perfume.description}
              </p>
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