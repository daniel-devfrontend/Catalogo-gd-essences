import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Header, Footer, PerfumeCard, PerfumeDetailModal } from '@/components';
import { getCatalogData } from '@/lib/catalogData';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
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
  const collectionImage = location.state?.collectionImage || '';
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
          <div className="relative mb-10 min-h-[220px] overflow-hidden border border-border bg-muted md:min-h-[300px]">
            {collectionImage ? (
              <img
                src={collectionImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <Link
              to="/colecciones"
              className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 border border-white/35 bg-black/35 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-black/55"
              aria-label="Volver a colecciones"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Link>
            <div className="relative flex min-h-[220px] flex-col justify-end p-6 text-white md:min-h-[300px] md:p-10">
              <h1
                className="text-4xl font-medium md:text-5xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {collection.title}
              </h1>
              <p
                className="mt-3 max-w-2xl text-lg leading-relaxed text-white/80"
              >
                {collection.description}
              </p>
            </div>
          </div>
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
