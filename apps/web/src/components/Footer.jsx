import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, Instagram, Mail, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const portfolioUrl = 'https://daniel-devfrontend.github.io/My-Portfolio/';
const whatsappUrl = 'https://wa.me/584246436776?text=Hola%20Daniel%2C%20me%20interesa%20una%20p%C3%A1gina%20web%20para%20mi%20negocio.';

const Footer = () => {
  const handleShare = async () => {
    const shareData = {
      title: 'G&D Essences',
      text: 'Descubre el catálogo de fragancias de G&D Essences.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      toast.success('Enlace copiado', {
        description: 'Ya puedes compartir el catálogo donde quieras.',
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('No se pudo compartir el catálogo', {
          description: 'Inténtalo de nuevo en unos segundos.',
        });
      }
    }
  };

  return <footer className="bg-primary text-primary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col items-start">
            <img src={`${import.meta.env.BASE_URL}Logos/LogoWhite2-transparent.png`} alt="G&D Essences Logo" className="h-[55px] w-auto object-contain mb-6 filter invert" />
            <p className="text-sm leading-relaxed text-primary-foreground/70 max-w-xs">
              En G&D Essences ofrecemos fragancias de buena calidad inspiradas en el lujo moderno, pensadas para quienes desean un aroma elegante a un precio accesible. Perfumes con estilo, esencia y personalidad. G&D Essences: tu aroma, tu estilo.
            </p>
          </div>

          <div>
            <div>
              <span className="text-sm font-semibold tracking-widest uppercase block mb-3">Descubre más de G&amp;D Essences</span>
              <p className="text-sm leading-relaxed text-primary-foreground/70 max-w-xs mb-6">
                Síguenos y conoce nuestras novedades, colecciones y fragancias favoritas.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/gydessences?igsh=Z2pxd3k5Z2tncnl4" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary flex items-center justify-center transition-all duration-300" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://www.tiktok.com/@gdessences?_r=1&_t=ZN-98udqKmF0ty" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary flex items-center justify-center transition-all duration-300" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
                <button type="button" onClick={handleShare} className="w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-foreground/60" aria-label="Compartir catálogo" title="Compartir catálogo">
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="mt-10 border-t border-primary-foreground/10 pt-8">
              <span className="text-sm font-semibold tracking-widest uppercase block mb-3">¿Quieres una página como esta?</span>
              <p className="text-sm leading-relaxed text-primary-foreground/70 max-w-xs">
                G&amp;D Essences cuenta con una página diseñada a medida. Solicita la tuya para tu negocio o emprendimiento.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="https://www.instagram.com/daniel.devfrontend?igsi=MTBmbDI4bTE5dXNkZg%3D%3D" target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary items-center justify-center transition-all duration-300" aria-label="Instagram de Daniel Marin" title="Instagram de Daniel Marin">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary items-center justify-center transition-all duration-300" aria-label="Contactar por WhatsApp" title="WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a href="https://github.com/daniel-devfrontend" target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary items-center justify-center transition-all duration-300" aria-label="Ver perfil de GitHub" title="GitHub">
                  <Github className="h-4 w-4" />
                </a>
                <a href="mailto:danimarin.dev@gmail.com" className="inline-flex w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary items-center justify-center transition-all duration-300" aria-label="Enviar correo electrónico" title="Correo">
                  <Mail className="h-4 w-4" />
                </a>
                <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary items-center justify-center transition-all duration-300" aria-label="Ver portafolio web" title="Portafolio">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-6 border-l-2 border-primary-foreground/30 pl-4">
                <p className="text-sm text-primary-foreground/80">¿Hacemos realidad tu página web?</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground hover:underline">
                  <MessageCircle className="h-4 w-4" />
                  Solicitar una página
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-primary-foreground/50">
              © 2026 G&D Essences. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-xs">
              <Link to="/" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200">
                Política de Privacidad
              </Link>
              <Link to="/" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200">
                Términos de Servicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;