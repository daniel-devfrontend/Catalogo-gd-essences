import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button, Header, Footer, PerfumeCard, PerfumeDetailModal } from '@/components';
import { getProducts } from '@/lib/dataService';
import { perfumes as localPerfumes } from '@/data/perfumes.js';

const HomePage = () => {
  const [perfumes, setPerfumes] = React.useState([]);
  const [selectedPerfume, setSelectedPerfume] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPerfumes = async () => {
      setIsLoading(true);
      try {
        const availablePerfumes = await getProducts();
        setPerfumes(Array.isArray(availablePerfumes) && availablePerfumes.length ? availablePerfumes : localPerfumes);
      } catch (error) {
        console.warn('No se pudieron cargar los perfumes desde Supabase, usando catálogo local.', error);
        setPerfumes(localPerfumes);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerfumes();
  }, []);
  // Selección aleatoria diaria de 3 perfumes
  function getDailyRandomPerfumes(perfumes, count = 3) {
    // Usar la fecha como semilla para que cambie cada día
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // Algoritmo de shuffle determinista basado en la semilla
    function seededRandom(seed) {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }
    const arr = [...perfumes];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
  }
  const featuredPerfumes = React.useMemo(() => getDailyRandomPerfumes(perfumes, 4), [perfumes]);
  const handlePerfumeClick = perfume => {
    setSelectedPerfume(perfume);
    setIsModalOpen(true);
  };
  return <>
      <Helmet>
        <title>G&D Essences - Alta Perfumería</title>
        <meta name="description" content="Descubre nuestra exclusiva colección de fragancias de lujo. G&D Essences ofrece perfumes premium de las mejores marcas internacionales." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1688297029642-a69d7684ff7a?q=80&w=1600&auto=format&fit=crop" alt="Luxury perfume aesthetic" className="w-full h-full object-cover object-center filter brightness-75" loading="eager" fetchPriority="high" />
              <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 1,
              ease: "easeOut"
            }}>
                <span className="block text-white/80 text-sm tracking-[0.3em] uppercase mb-6 font-medium">
                  Catalogo Virtual
                </span>
                <h1 className="text-[2.15rem] md:text-[3.56rem] lg:text-[4.28rem] font-medium text-white mb-8 leading-tight" style={{
                fontFamily: 'Playfair Display, serif',
                textBalance: 'balance'
              }}>
                  Tus fragancias favoritas<br /> en un solo lugar
                </h1>
                <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                  <Button asChild size="lg" className="rounded-none bg-white text-black hover:bg-white/90 h-14 px-10 text-sm tracking-widest uppercase font-medium transition-all duration-300">
                    <Link to="/catalogo">
                      Explorar Colección
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="py-32 bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.8
            }}>
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <img src={`${import.meta.env.BASE_URL}Logos/LogoWhite2-transparent.png`} alt="G&D Essences Logo" className="max-h-[240px] md:max-h-[360px] w-auto object-contain filter brightness-100 drop-shadow-lg" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground" style={{
                fontFamily: 'Cormorant Garamond, Playfair Display, serif',
                textBalance: 'balance'
              }}>
                  "La esencia de las grandes marcas, ahora a tu alcance"
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                  G&D Essences ofrece perfumes de calidad top quality para quienes buscan lujo auténtico a un costo accesible. Seleccionamos fragancias exclusivas elaboradas con materias primas importadas, logrando aromas un 90% a 99% idénticos al original. Al ser Eau de Parfum o Extrait de Parfum, aseguran una alta concentración y una fijación prolongada en la piel de 6 a 12 horas. Cada esencia refleja elegancia, personalidad y una experiencia premium al alcance de más personas. G&D Essences: lujo en cada gota.
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-32 bg-muted/30 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <motion.div initial={{
                opacity: 0,
                x: -20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.6
              }}>
                  <h2 className="text-3xl md:text-4xl font-medium text-foreground text-left md:text-left" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                    ¡Más vendidos hoy!
                  </h2>
                </motion.div>
                <motion.div initial={{
                opacity: 0,
                x: 20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.6
              }}>
                  <Link to="/catalogo" className="text-sm font-medium tracking-widest uppercase text-foreground hover:text-muted-foreground transition-colors flex items-center group">
                    Ver todo <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="animate-pulse">
                      <div className="bg-muted border border-border aspect-[4/5]" />
                      <div className="mt-4 h-4 bg-muted w-3/4" />
                      <div className="mt-2 h-3 bg-muted w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
                  {featuredPerfumes.map(perfume => <PerfumeCard key={perfume.id} perfume={perfume} onClick={() => handlePerfumeClick(perfume)} />)}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />

        <PerfumeDetailModal perfume={selectedPerfume} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </>;
};
export default HomePage;