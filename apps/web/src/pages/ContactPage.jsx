import { Instagram, Facebook } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Header, Footer } from '@/components';

function ContactPage() {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/gd_essences?igsh=dThldjUwOTJwNTN1',
      handle: '@gd_essences',
      description: 'Descubre nuestras últimas novedades y estética visual.'
    }, {
      name: 'TikTok',
      icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>,
      url: 'https://www.tiktok.com/@gd.essences?_r=1&_t=ZS-95KORfYhJcj',
      handle: '@G&D Essences',
      description: 'Reseñas, unboxings y contenido dinámico.'
    }, {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/share/1EC7yn14tk/',
      handle: 'G&D Essences',
      description: 'Únete a nuestra comunidad y mantente informado.'
    }
  ];
  return <>
    <Helmet>
      <title>Conecta con nosotros - G&D Essences</title>
      <meta name="description" content="Síguenos en nuestras redes sociales para descubrir las últimas novedades en alta perfumería." />
    </Helmet>

    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-medium mb-6 text-foreground" style={{
              fontFamily: 'Playfair Display, serif',
              textBalance: 'balance'
            }}>
              Conecta con Nosotros
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
              En G&D Essences compartimos nuestra pasión por las fragancias y el estilo. Síguenos y descubre novedades, colecciones y el mundo detrás de cada esencia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {socialLinks.map((social, index) => <motion.a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }} className="group block p-8 border border-border bg-card hover:border-foreground/40 transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto rounded-full border border-border flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-colors duration-300 text-foreground">
                  <social.icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-medium mb-2 text-foreground" style={{
                  fontFamily: 'Playfair Display, serif'
                }}>
                  {social.name}
                </h2>
                <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  {social.handle}
                </p>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {social.description}
                </p>
              </motion.a>)}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </>;
}

export default ContactPage;