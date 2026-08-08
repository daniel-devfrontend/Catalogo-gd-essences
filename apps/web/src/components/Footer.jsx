import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-start">
            <img src={`${import.meta.env.BASE_URL}Logos/LogoWhite2-transparent.png`} alt="G&D Essences Logo" className="h-[55px] w-auto object-contain mb-6 filter invert" />
            <p className="text-sm leading-relaxed text-primary-foreground/70 max-w-xs">
              En G&D Essences ofrecemos fragancias de buena calidad inspiradas en el lujo moderno, pensadas para quienes desean un aroma elegante a un precio accesible. Perfumes con estilo, esencia y personalidad. G&D Essences: tu aroma, tu estilo.
            </p>
          </div>

          <div>
            <span className="text-sm font-semibold tracking-widest uppercase block mb-6">Contáctanos</span>
            <p className="text-sm text-primary-foreground/80 mb-2">Teléfono / WhatsApp:</p>
            <a href="https://wa.me/584246436776" target="_blank" rel="noopener noreferrer" className="text-base font-normal text-primary-foreground hover:underline block">
              +58 424 6436776
            </a>
            <div className="mt-8">
              <span className="text-sm font-semibold tracking-widest uppercase block mb-6">Síguenos</span>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/gd_essences?igsh=dThldjUwOTJwNTN1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary flex items-center justify-center transition-all duration-300" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://www.tiktok.com/@gd.essences?_r=1&_t=ZS-95KORfYhJcj" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary flex items-center justify-center transition-all duration-300" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
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