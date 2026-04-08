import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button, Header, Footer, PerfumeCard, PerfumeDetailModal } from '@/components';
import { perfumes } from '@/data/perfumes.js';
const HomePage = () => {
  const [selectedPerfume, setSelectedPerfume] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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
  const featuredPerfumes = getDailyRandomPerfumes(perfumes, 3);
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
              <img src="https://images.unsplash.com/photo-1688297029642-a69d7684ff7a?q=80&w=2000" alt="Luxury perfume aesthetic" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-black/40"></div>
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
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-white mb-8 leading-tight" style={{
                fontFamily: 'Playfair Display, serif',
                textBalance: 'balance'
              }}>
                  La esencia de la<br />elegancia absoluta
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
                <img src="https://horizons-cdn.hostinger.com/c05faf8a-437d-406d-99ba-9cff3f611d9b/f817902bcc22ce898fb35b749bf91d9f.png" alt="G&D Essences Logo" className="h-16 w-auto object-contain mx-auto mb-12" />
                <h2 className="text-3xl md:text-4xl font-medium mb-8 text-foreground" style={{
                fontFamily: 'Playfair Display, serif',
                textBalance: 'balance'
              }}>
                  G&D Essences lujo en cada gota
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                  G&D Essences ofrece perfumes de calidad top quality para quienes buscan lujo auténtico a un costo accesible. Seleccionamos fragancias exclusivas con excelente fijación y aromas que destacan sin esfuerzo. Cada esencia refleja elegancia, personalidad y una experiencia premium al alcance de más personas. G&D Essences: lujo en cada gota.
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

              <div className="grid md:grid-cols-3 gap-8">
                {featuredPerfumes.map(perfume => <PerfumeCard key={perfume.id} perfume={perfume} onClick={() => handlePerfumeClick(perfume)} />)}
              </div>
            </div>
          </section>
        </main>

        <Footer />

        <PerfumeDetailModal perfume={selectedPerfume} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </>;
};
export default HomePage;