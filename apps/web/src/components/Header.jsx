import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button, Sheet, SheetContent, SheetTrigger } from '@/components/ui';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const isHome = location.pathname === '/';

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Colecciones', path: '/colecciones' },
    { name: 'Contacto', path: '/contacto' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    if (path === '/colecciones') {
      return location.pathname === '/colecciones' || location.pathname.startsWith('/coleccion/');
    }

    return location.pathname === path;
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border ${isHome ? 'bg-transparent' : 'bg-background/95'} backdrop-blur supports-[backdrop-filter]:bg-background/60`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}Logos/LogoWhite2-transparent.png`}
                alt="G&D Essences"
                className="h-20 w-auto object-contain"
              />
            </div>
            <img
              src={`${import.meta.env.BASE_URL}Logos/LogoWhite2-transparent.png`}
              alt="G&D Essences"
              className="h-12 w-auto object-contain sm:hidden"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-foreground border-b-2 border-foreground pb-1'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-l border-border">
              <nav className="flex flex-col space-y-6 mt-12">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium tracking-wide uppercase transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;