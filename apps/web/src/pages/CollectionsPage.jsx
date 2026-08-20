import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Header, Footer, CollectionCard } from '@/components';
import { getCatalogData } from '@/lib/catalogData';

const CollectionsPage = () => {
  const [perfumes, setPerfumes] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const collectionsWithImages = React.useMemo(() => {
    return collections.map((collection) => ({
      ...collection,
      image: collection.image || perfumes.find((perfume) => perfume.collection === collection.id && perfume.image)?.image || '',
    }));
  }, [collections, perfumes]);

  const featuredCollection = collectionsWithImages.find((collection) => collection.id === 'carolina-herrera') || collectionsWithImages[0];
  const secondaryCollections = collectionsWithImages.filter((collection) => collection.id !== featuredCollection?.id);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { products, collections } = await getCatalogData();
        setPerfumes(products.filter((product) => product.status !== 'draft'));
        setCollections(collections);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Colecciones - G&D Essences</title>
        <meta name="description" content="Descubre nuestras exclusivas colecciones de fragancias de las mejores casas de perfumería del mundo." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-20 text-center"
            >
              <h1
                className="text-4xl md:text-6xl font-medium mb-6 text-foreground"
                style={{ fontFamily: 'Playfair Display, serif', textBalance: 'balance' }}
              >
                Casas de Perfumería
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
                Descubre el legado de las casas que han transformado el perfume en un arte.
              </p>
            </motion.div>

            <div className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {isLoading ? 'Cargando...' : `${collections.length} Colecciones`}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="col-span-2 h-[360px] animate-pulse bg-muted lg:col-span-2" />
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`collection-skeleton-${index}`} className="h-[230px] animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {featuredCollection && (
                  <div className="col-span-2 lg:col-span-2">
                    <CollectionCard
                      collection={{ ...featuredCollection, count: perfumes.filter((perfume) => perfume.collection === featuredCollection.id).length }}
                      index={0}
                    />
                  </div>
                )}
                {secondaryCollections.map((collection, index) => {
                  const count = perfumes.filter(p => p.collection === collection.id).length;
                  return (
                    <CollectionCard
                      key={collection.id}
                      collection={{ ...collection, count }}
                      index={index + 1}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CollectionsPage;