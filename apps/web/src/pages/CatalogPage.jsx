import React from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Header, Footer, PerfumeCard, PerfumeDetailModal } from '@/components';
import { perfumes, collections } from '@/data/perfumes.js';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPerfume, setSelectedPerfume] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCollection, setSelectedCollection] = React.useState(searchParams.get('collection') || 'all');
  const [sortBy, setSortBy] = React.useState('name');

  const handlePerfumeClick = (perfume) => {
    setSelectedPerfume(perfume);
    setIsModalOpen(true);
  };

  const filteredPerfumes = React.useMemo(() => {
    let filtered = [...perfumes];

    if (selectedCollection !== 'all') {
      filtered = filtered.filter(p => p.collection === selectedCollection);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.collection.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCollection, sortBy]);

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
                  {filteredPerfumes.length} Resultados
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

            {filteredPerfumes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPerfumes.map((perfume) => (
                  <PerfumeCard
                    key={perfume.id}
                    perfume={perfume}
                    onClick={() => handlePerfumeClick(perfume)}
                  />
                ))}
              </div>
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