import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster, ScrollToTop } from '@/components';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import CollectionsPage from './pages/CollectionsPage.jsx';
import CollectionDetailPage from './pages/CollectionDetailPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/colecciones" element={<CollectionsPage />} />
        <Route path="/coleccion/:id" element={<CollectionDetailPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;