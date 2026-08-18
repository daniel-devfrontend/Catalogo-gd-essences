import React from 'react';
import { Route, Routes, HashRouter as Router } from 'react-router-dom';
import { Toaster, ScrollToTop } from '@/components';

const HomePage = React.lazy(() => import('./pages/HomePage.jsx'));
const CatalogPage = React.lazy(() => import('./pages/CatalogPage.jsx'));
const CollectionsPage = React.lazy(() => import('./pages/CollectionsPage.jsx'));
const CollectionDetailPage = React.lazy(() => import('./pages/CollectionDetailPage.jsx'));
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.jsx'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <React.Suspense fallback={<div className="min-h-screen bg-background" aria-label="Cargando página" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/colecciones" element={<CollectionsPage />} />
          <Route path="/coleccion/:id" element={<CollectionDetailPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </React.Suspense>
      <Toaster />
    </Router>
  );
}

export default App;