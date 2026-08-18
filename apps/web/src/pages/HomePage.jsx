import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button, Header, Footer, PerfumeCard, PerfumeDetailModal } from '@/components';
import { getProducts } from '@/lib/dataService';
import { perfumes as localPerfumes } from '@/data/perfumes.js';
import { Download } from 'lucide-react';

const HomePage = () => {
  const [perfumes, setPerfumes] = React.useState([]);
  const [selectedPerfume, setSelectedPerfume] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [installPrompt, setInstallPrompt] = React.useState(null);
  const [showInstallOptions, setShowInstallOptions] = React.useState(false);
  const [installMessage, setInstallMessage] = React.useState('');

  React.useEffect(() => {
    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
  }, []);

  const handleInstallCatalog = () => {
    setShowInstallOptions(true);
  };

  const installCatalog = async () => {
    if (!installPrompt) {
      setInstallMessage('La instalación no está disponible en este navegador ahora mismo. Abre el menú del navegador y elige "Instalar aplicación".');
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setShowInstallOptions(false);
    setInstallMessage('');
  };

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
              <img src="https://images.unsplash.com/photo-1688297029642-a69d7684ff7a?q=80&w=1600&auto=format&fit=crop" alt="Luxury perfume aesthetic" className="w-full h-full object-cover object-center filter brightness-75" loading="eager" />
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
                <button
                  type="button"
                  onClick={handleInstallCatalog}
                  className="mx-auto mt-5 inline-flex items-center gap-2 border border-white/35 bg-black/20 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm transition hover:border-white/70 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Instalar catálogo
                </button>
                {showInstallOptions ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5" role="dialog" aria-modal="true" aria-label="Instalar catálogo">
                    <div className="w-full max-w-sm border border-white/20 bg-[#080808] p-6 text-left shadow-2xl">
                      <div className="mb-5 flex items-center gap-4">
                        <img src={`${import.meta.env.BASE_URL}Logos/LogoApp2-192.png?v=1`} alt="G&D Essences" className="h-16 w-16 rounded-2xl object-cover" />
                        <div>
                          <h2 className="text-lg font-medium text-white">G&D Essences Catálogo</h2>
                          <p className="mt-1 text-xs text-white/60">Acceso directo a la parte pública</p>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <button type="button" onClick={installCatalog} className="flex items-center justify-center border border-white bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-white/90">
                          Instalar catálogo
                        </button>
                        <Link to="/catalogo" onClick={() => setShowInstallOptions(false)} className="flex items-center justify-center border border-white/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white">
                          Abrir catálogo
                        </Link>
                        <button type="button" onClick={() => setShowInstallOptions(false)} className="py-2 text-xs text-white/50 transition hover:text-white">Cerrar</button>
                        {installMessage ? <p className="text-center text-[11px] leading-relaxed text-white/55">{installMessage}</p> : null}
                      </div>
                    </div>
                  </div>
                ) : null}
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