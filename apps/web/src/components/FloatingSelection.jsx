import React from 'react';
import { Check, ShoppingBag, Trash2, X } from 'lucide-react';
import { useSelection } from '@/context/SelectionContext';

const HEADER_SAFE_ZONE = 104;

const FloatingSelection = () => {
  const { selectedProducts, removeProduct } = useSelection();
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('gd-essences-selection-position') || '{"right":20,"bottom":20}');
    } catch (error) {
      return { right: 20, bottom: 20 };
    }
  });
  const dragRef = React.useRef(null);
  const suppressClickRef = React.useRef(false);
  const getMaxBottom = () => Math.max(8, window.innerHeight - 64 - HEADER_SAFE_ZONE);
  const safePosition = {
    right: Math.max(8, Math.min(position.right, Math.max(8, window.innerWidth - 64))),
    bottom: Math.max(8, Math.min(position.bottom, getMaxBottom())),
  };

  React.useEffect(() => {
    const keepButtonBelowHeader = () => {
      setPosition((previous) => {
        const nextPosition = {
          right: Math.max(8, Math.min(previous.right, Math.max(8, window.innerWidth - 64))),
          bottom: Math.max(8, Math.min(previous.bottom, getMaxBottom())),
        };
        return nextPosition.right === previous.right && nextPosition.bottom === previous.bottom ? previous : nextPosition;
      });
    };

    keepButtonBelowHeader();
    window.addEventListener('resize', keepButtonBelowHeader);
    return () => window.removeEventListener('resize', keepButtonBelowHeader);
  }, []);

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRight: safePosition.right,
      startBottom: safePosition.bottom,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) drag.moved = true;

    const maxRight = Math.max(8, window.innerWidth - 64);
    const maxBottom = getMaxBottom();
    setPosition({
      right: Math.min(maxRight, Math.max(8, drag.startRight - deltaX)),
      bottom: Math.min(maxBottom, Math.max(8, drag.startBottom - deltaY)),
    });
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
  };

  const handleButtonClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setIsOpen((previous) => !previous);
  };

  React.useEffect(() => {
    window.localStorage.setItem('gd-essences-selection-position', JSON.stringify(position));
  }, [position]);

  if (!selectedProducts.length) return null;

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesan estos perfumes: ${selectedProducts.map((product) => `${product.name} ($${Number(product.price || 0).toFixed(2)})`).join(', ')}.`
  );

  return (
    <div className="fixed z-40 w-[min(22rem,calc(100vw-2.5rem))]" style={{ right: safePosition.right, bottom: safePosition.bottom }}>
      {isOpen ? (
        <div className="mb-3 border border-border bg-card p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Mi selección</p>
              <p className="mt-1 text-sm text-foreground">{selectedProducts.length} perfume{selectedProducts.length === 1 ? '' : 's'}</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Cerrar selección">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">${Number(product.price || 0).toFixed(2)}</p>
                </div>
                <button type="button" onClick={() => removeProduct(product.id)} className="shrink-0 text-muted-foreground transition-colors hover:text-foreground" aria-label={`Quitar ${product.name} de la selección`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <a href={`https://wa.me/584246436776?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="mt-4 flex h-11 items-center justify-center gap-2 bg-black px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80">
            <Check className="h-4 w-4" />
            Enviar selección por WhatsApp
          </a>
        </div>
      ) : null}

      <button type="button" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onClick={handleButtonClick} className="relative ml-auto flex h-14 w-14 touch-none items-center justify-center rounded-full bg-black text-white shadow-2xl transition-transform hover:-translate-y-0.5" aria-expanded={isOpen} aria-label="Abrir mi selección" title="Abrir mi selección">
        <ShoppingBag className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-black">
          {selectedProducts.length}
        </span>
      </button>
    </div>
  );
};

export default FloatingSelection;