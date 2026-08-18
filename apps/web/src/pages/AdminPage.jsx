import React from 'react';
import { Helmet } from 'react-helmet';
import { Download } from 'lucide-react';
import { Header, Footer, ProductAdmin } from '@/components';
import { Button, Input, Label } from '@/components/ui';
import { isSupabaseEnabled, getCurrentUser, onAuthStateChange, signIn, signOut } from '@/lib/authService';

const LoginForm = ({ onSuccess, onError }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    onError('');

    const { error } = await signIn({ email, password });

    if (error) {
      onError(error.message || 'Error al iniciar sesión.');
      setLoading(false);
      return;
    }

    onSuccess();
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto rounded-none border border-border bg-card p-8">
      <h2 className="text-2xl font-medium mb-6 text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
        Accede al panel de administración
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Correo</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Contraseña</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full rounded-none" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
};

const AdminPage = () => {
  const [user, setUser] = React.useState(null);
  const [status, setStatus] = React.useState('loading');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [installPrompt, setInstallPrompt] = React.useState(null);
  const [installMessage, setInstallMessage] = React.useState('');

  React.useEffect(() => {
    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
  }, []);

  const handleInstallAdmin = async () => {
    if (!installPrompt) {
      setInstallMessage('La instalación no está disponible ahora. Abre el menú del navegador y elige "Instalar aplicación".');
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallMessage('');
  };

  React.useEffect(() => {
    if (!isSupabaseEnabled()) {
      setStatus('disabled');
      return;
    }

    let unsubscribe;

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error cargando sesión de administrador:', error);
      } finally {
        setStatus('ready');
      }
    };

    loadUser();
    unsubscribe = onAuthStateChange((currentUser) => setUser(currentUser));

    return () => unsubscribe?.();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <>
      <Helmet>
        <title>Administración - G&D Essences</title>
        <meta name="description" content="Panel para crear productos y añadir varias fotos a cada uno." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={handleInstallAdmin}
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                title="Instalar G&D Admin"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Instalar G&D Admin
              </button>
            </div>
            {installMessage ? (
              <p className="mb-6 text-right text-xs text-muted-foreground" aria-live="polite">{installMessage}</p>
            ) : null}

            {status === 'loading' && (
              <div className="rounded-none border border-border bg-card p-8 text-center text-foreground">
                Cargando panel de administración...
              </div>
            )}

            {status === 'disabled' && (
              <div className="rounded-none border border-border bg-card p-8 text-foreground">
                <h2 className="text-2xl font-medium mb-4">Supabase no está configurado</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Añade las variables <code className="mx-1 rounded-sm bg-muted px-1 py-0.5">VITE_SUPABASE_URL</code> y <code className="mx-1 rounded-sm bg-muted px-1 py-0.5">VITE_SUPABASE_ANON_KEY</code> en el archivo <code>.env</code>.
                </p>
                <p className="text-sm text-muted-foreground">
                  La administración necesita Supabase para funcionar.
                </p>
              </div>
            )}

            {status === 'ready' && !user && (
              <div className="space-y-6">
                {errorMessage ? (
                  <div className="rounded-none border border-rose-400 bg-rose-500/10 p-4 text-sm text-rose-400">
                    {errorMessage}
                  </div>
                ) : null}
                <LoginForm onSuccess={() => setErrorMessage('')} onError={setErrorMessage} />
              </div>
            )}

            {status === 'ready' && user && (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-none border border-border bg-card p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Sesión iniciada como</p>
                    <p className="text-base font-medium text-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline" className="rounded-none" onClick={handleLogout}>
                    Cerrar sesión
                  </Button>
                </div>
                <ProductAdmin />
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AdminPage;
