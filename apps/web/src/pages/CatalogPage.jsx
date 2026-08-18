import React from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Header, Footer, PerfumeCard, PerfumeDetailModal } from '@/components';
import { getCatalogData } from '@/lib/catalogData';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [perfumes, setPerfumes] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [selectedPerfume, setSelectedPerfume] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCollection, setSelectedCollection] = React.useState(searchParams.get('collection') || 'all');
  const [sortBy, setSortBy] = React.useState('name');
  const [isLoading, setIsLoading] = React.useState(true);
  const [visibleCount, setVisibleCount] = React.useState(12);
  const pageSize = 12;
  const observerRef = React.useRef(null);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { products, collections } = await getCatalogData();
        setPerfumes(products.filter((product) => product.status !== 'draft'));
        setCollections(collections);
      } catch (error) {
        setPerfumes([]);
        setCollections([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  React.useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCollection, sortBy]);

  const handlePerfumeClick = (perfume) => {
    setSelectedPerfume(perfume);
    setIsModalOpen(true);
  };

  const filteredPerfumes = React.useMemo(() => {
    let filtered = [...perfumes];

    if (selectedCollection !== 'all') {
      filtered = filtered.filter((p) => p.collection === selectedCollection);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const name = p.name?.toLowerCase() || '';
        const description = p.description?.toLowerCase() || '';
        const collection = p.collection?.toLowerCase() || '';

        return name.includes(query) || description.includes(query) || collection.includes(query);
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return filtered;
  }, [perfumes, searchQuery, selectedCollection, sortBy]);

  const visiblePerfumes = React.useMemo(() => {
    return filteredPerfumes.slice(0, visibleCount);
  }, [filteredPerfumes, visibleCount]);

  const hasMore = visibleCount < filteredPerfumes.length;

  React.useEffect(() => {
    if (!hasMore || isLoading) return;

    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, filteredPerfumes.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, filteredPerfumes.length]);

  return (
    <>
      <Helmet>
        <title>Catálogo - G&D Essences</title>
        <meta name="description" content="Explora nuestro catálogo completo de fragancias de lujo. Filtra por colección, busca por nombre y encuentra tu perfume perfecto." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h1
                className="text-4xl md:text-5xl font-medium mb-6 text-foreground"
                style={{ fontFamily: 'Playfair Display, serif', textBalance: 'balance' }}
              >
                Catálogo
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
                Más que un aroma, una extensión de tu personalidad. Encuentra el tuyo.
              </p>
            </div>

            <div className="bg-background border border-border p-6 mb-12">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar fragancia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 rounded-none border-border focus-visible:ring-1 focus-visible:ring-foreground text-foreground placeholder:text-muted-foreground h-12"
                  />
                </div>

                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="rounded-none border-border focus:ring-1 focus:ring-foreground text-foreground h-12">
                    <SelectValue placeholder="Colección" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    <SelectItem value="all">Todas las colecciones</SelectItem>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.title}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-none border-border focus:ring-1 focus:ring-foreground text-foreground h-12">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    <SelectItem value="name">Nombre (A-Z)</SelectItem>
                    <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
                    <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs tracking-widest uppercase text-muted-foreground font-medium">
                <span>
                  {isLoading ? 'Cargando...' : `${filteredPerfumes.length} Resultados`}
                </span>
                {(searchQuery || selectedCollection !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCollection('all');
                      setSearchParams({});
                    }}
                    className="text-foreground hover:text-muted-foreground transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {Array.from({ length: pageSize }).map((_, index) => (
                  <div key={`catalog-skeleton-${index}`} className="animate-pulse">
                    <div className="bg-muted border border-border aspect-[4/5]" />
                    <div className="mt-4 h-5 bg-muted w-2/3" />
                    <div className="mt-2 h-3 bg-muted w-1/2" />
                    <div className="mt-4 h-4 bg-muted w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredPerfumes.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                  {visiblePerfumes.map((perfume) => (
                    <div key={perfume.id} className="w-full">
                      <PerfumeCard
                        perfume={perfume}
                        onClick={() => handlePerfumeClick(perfume)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex items-center justify-center gap-3">
                  {hasMore ? (
                    <div ref={observerRef} className="h-10 w-full flex items-center justify-center">
                      <span className="text-xs tracking-widest uppercase text-muted-foreground">
                        Desplázate para ver más
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground tracking-widest uppercase">
                      Ya viste todo el catálogo
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-32 border border-border bg-muted/10">
                <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-xl font-medium mb-3 text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                  No se encontraron resultados
                </h3>
                <p className="text-muted-foreground mb-8 font-light">
                  Intenta ajustar tus criterios de búsqueda
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCollection('all');
                    setSearchParams({});
                  }}
                  className="rounded-none bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-xs tracking-widest uppercase font-medium"
                >
                  Ver todo el catálogo
                </Button>
              </div>
            )}
          </div>
        </main>

        <Footer />

        <PerfumeDetailModal
          perfume={selectedPerfume}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
};

export default CatalogPage;