import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Header, Footer, CollectionCard } from '@/components';
import { getCatalogData } from '@/lib/catalogData';

const CollectionsPage = () => {
  const [perfumes, setPerfumes] = React.useState([]);
  const [collections, setCollections] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
      const { products, collections } = await getCatalogData();
      setPerfumes(products.filter((product) => product.status !== 'draft'));
      setCollections(collections);
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
                className="text-4xl md:text-5xl font-medium mb-6 text-foreground"
                style={{ fontFamily: 'Playfair Display, serif', textBalance: 'balance' }}
              >
                Casas de Perfumería
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
                Descubre el legado de las casas que han transformado el perfume en un arte.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {collections.map((collection, index) => {
                const count = perfumes.filter(p => p.collection === collection.id).length;
                return (
                  <CollectionCard
                    key={collection.id}
                    collection={{ ...collection, count }}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CollectionsPage;