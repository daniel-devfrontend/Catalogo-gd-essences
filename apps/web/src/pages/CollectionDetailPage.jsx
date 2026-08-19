import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Header, Footer, PerfumeCard, PerfumeDetailModal } from '@/components';
import { getCatalogData } from '@/lib/catalogData';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const [perfumes, setPerfumes] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      const { products, collections } = await getCatalogData();
      setPerfumes(products.filter((product) => product.status !== 'draft'));
      setCollections(collections);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const normalizedId = decodeURIComponent(id || '');
  const collection = collections.find((item) => String(item.id) === normalizedId);
  const perfumesInCollection = perfumes.filter((product) => String(product.collection) === normalizedId);

  const [selectedPerfume, setSelectedPerfume] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handlePerfumeClick = (perfume) => {
    setSelectedPerfume(perfume);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center text-sm uppercase tracking-widest text-muted-foreground">
          Cargando colección...
        </main>
        <Footer />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-medium mb-4">Colección no encontrada</h2>
          <Link to="/colecciones" className="text-blue-600 underline">Volver a colecciones</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{collection.title} - G&D Essences</title>
        <meta name="description" content={collection.description} />
      </Helmet>
      <Header />
      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-medium mb-6 text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
            {collection.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl font-light">
            {collection.description}
          </p>
          {perfumesInCollection.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {perfumesInCollection.map((perfume) => (
                <PerfumeCard key={perfume.id} perfume={perfume} onClick={() => handlePerfumeClick(perfume)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border border-border bg-muted/10">
              <h3 className="text-xl font-medium mb-3 text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
                No hay perfumes en esta colección
              </h3>
              <Link to="/colecciones" className="text-blue-600 underline">Volver a colecciones</Link>
            </div>
          )}
        </div>
      </main>
      <PerfumeDetailModal
        perfume={selectedPerfume}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Footer />
    </div>
  );
};

export default CollectionDetailPage;
