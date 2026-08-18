import React from 'react';
import { Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '@/components/ui';
import { getProducts, createOrUpdateProduct, uploadProductImage, addImagesToProduct, getCollections, createCollection, deleteCollection, deleteProduct, deleteProductPermanently, restoreProduct } from '@/lib/dataService';
import { resolveProductImage } from '@/lib/productImageResolver';

const emptyForm = {
  name: '',
  price: '',
  originalPrice: '',
  description: '',
  collection: 'personalizados',
  image: '',
  videoUrl: '',
  status: 'published',
  deletedAt: null,
};

const emptyCollectionForm = {
  title: '',
  description: '',
};

const ProductAdmin = () => {
  const [products, setProducts] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [form, setForm] = React.useState(emptyForm);
  const [collectionForm, setCollectionForm] = React.useState({ title: '', description: '' });
  const [pendingFiles, setPendingFiles] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [toast, setToast] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deletingLabel, setDeletingLabel] = React.useState('');
  const [viewMode, setViewMode] = React.useState('list');
  const [collectionSearch, setCollectionSearch] = React.useState('');
  const [productFilter, setProductFilter] = React.useState('published');
  const [productSearch, setProductSearch] = React.useState('');
  const [productSort, setProductSort] = React.useState('collection-asc');
  const [showFilters, setShowFilters] = React.useState(false);
  const filtersRef = React.useRef(null);
  const [editingProductId, setEditingProductId] = React.useState(null);
  const [editingCollectionId, setEditingCollectionId] = React.useState(null);
  const [selectedProductId, setSelectedProductId] = React.useState(null);

  React.useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  React.useEffect(() => {
    const loadData = async () => {
      const [availableProducts, availableCollections] = await Promise.all([
        getProducts(),
        getCollections(),
      ]);

      setProducts(availableProducts);
      setCollections(availableCollections);
    };

    loadData();
  }, []);

  React.useEffect(() => {
    const handleOutside = (e) => {
      if (!showFilters) return;
      if (filtersRef.current && !filtersRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [showFilters]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage('');
    setToast(null);

    if (!form.name.trim() || !form.price) {
      setMessage('Añade al menos nombre y precio.');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentProduct = editingProductId
        ? products.find((product) => product.id === editingProductId)
        : null;
      const existingImages = Array.isArray(currentProduct?.images)
        ? [...currentProduct.images]
        : currentProduct?.image
          ? [currentProduct.image]
          : [];

      let imageUrls = [];

      if (pendingFiles.length) {
        imageUrls = await Promise.all(pendingFiles.map((file) => uploadProductImage(file)));
      }

      const nextImages = imageUrls.length
        ? [...new Set([...(existingImages || []), ...imageUrls])]
        : existingImages;

      const realImages = (nextImages || []).filter((image) => typeof image === 'string' && image.trim() && !image.includes('placeholder.svg'));

      const newProduct = {
        id: editingProductId || `custom-${Date.now()}`,
        name: form.name.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        description: form.description.trim() || 'Producto añadido desde el panel de administración.',
        collection: form.collection,
        image: realImages[0] || '',
        images: realImages,
        videoUrl: form.videoUrl.trim(),
        status: form.status,
        deletedAt: form.deletedAt || null,
      };

      await createOrUpdateProduct(newProduct);
      const availableProducts = await getProducts();
      setProducts(availableProducts);
      setForm(emptyForm);
      setPendingFiles([]);
      setSelectedProductId(newProduct.id);
      setEditingProductId(null);

      const successMessage = editingProductId ? 'Cambio guardado exitosamente.' : 'Producto registrado exitosamente.';
      setToast({
        type: 'success',
        text: successMessage,
      });
      setMessage(successMessage);
    } catch (error) {
      console.error(error);
      const detail = error?.details ? ` ${error.details}` : '';
      const errorMessage = error?.message ? `${error.message}.${detail}` : 'No se pudo guardar el producto.';

      setToast({
        type: 'error',
        text: errorMessage,
      });
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setPendingFiles((previous) => [...previous, ...files]);
  };

  const startEditingProduct = (product) => {
    setForm({
      name: product.name || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description || '',
      collection: product.collection || 'personalizados',
      image: product.image || '',
      videoUrl: product.video_url || product.videoUrl || '',
      status: product.status || 'published',
      deletedAt: product.deleted_at || product.deletedAt || null,
    });
    setEditingProductId(product.id);
    setSelectedProductId(product.id);
    setMessage('');

    setTimeout(() => {
      const formElement = document.getElementById('product-form-top');
      if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setForm(emptyForm);
    setPendingFiles([]);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Mover "${product.name}" a borradores?`)) {
      return;
    }

    setIsDeleting(true);
    setDeletingLabel(`Moviendo "${product.name}" a borradores...`);

    try {
      await deleteProduct(product.id);
      const availableProducts = await getProducts();
      setProducts(availableProducts);
      if (editingProductId === product.id) {
        cancelEdit();
      }
      setMessage('Producto movido a borradores. Será eliminado definitivamente en 7 días.');
      setToast({ type: 'success', text: 'Borrando producto...' });
    } catch (error) {
      console.error(error);
      setMessage('No se pudo mover el producto a borradores.');
      setToast({ type: 'error', text: 'No se pudo mover el producto a borradores.' });
    } finally {
      setIsDeleting(false);
      setDeletingLabel('');
    }
  };

  const handleRestoreProduct = async (product) => {
    if (!window.confirm(`¿Volver a publicar "${product.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    setDeletingLabel(`Restaurando "${product.name}"...`);

    try {
      await restoreProduct(product.id);
      const availableProducts = await getProducts();
      setProducts(availableProducts);
      setMessage('Producto restaurado y publicado nuevamente.');
      setToast({ type: 'success', text: 'Producto restaurado.' });
    } catch (error) {
      console.error(error);
      setMessage('No se pudo restaurar el producto.');
      setToast({ type: 'error', text: 'No se pudo restaurar el producto.' });
    } finally {
      setIsDeleting(false);
      setDeletingLabel('');
    }
  };

  const handleDeleteProductPermanently = async (product) => {
    if (!window.confirm(`¿Eliminar definitivamente "${product.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    setDeletingLabel(`Eliminando definitivamente "${product.name}"...`);

    try {
      await deleteProductPermanently(product.id);
      const availableProducts = await getProducts();
      setProducts(availableProducts);
      if (editingProductId === product.id) {
        cancelEdit();
      }
      setMessage('Producto eliminado definitivamente.');
      setToast({ type: 'success', text: 'Producto eliminado definitivamente.' });
    } catch (error) {
      console.error(error);
      setMessage('No se pudo eliminar el producto definitivamente.');
      setToast({ type: 'error', text: 'No se pudo eliminar el producto definitivamente.' });
    } finally {
      setIsDeleting(false);
      setDeletingLabel('');
    }
  };

  const startEditingCollection = (collection) => {
    setCollectionForm({
      title: collection.title || '',
      description: collection.description || '',
    });
    setEditingCollectionId(collection.id);
    setMessage('');
  };

  const cancelCollectionEdit = () => {
    setEditingCollectionId(null);
    setCollectionForm({ title: '', description: '' });
  };

  const handleCreateCollection = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!collectionForm.title.trim()) {
      setMessage('Añade el nombre de la colección.');
      return;
    }

    try {
      const newCollection = {
        id: editingCollectionId || collectionForm.title.toLowerCase().replace(/\s+/g, '-'),
        title: collectionForm.title.trim(),
        description: collectionForm.description.trim(),
      };

      await createCollection(newCollection);
      const updatedCollections = await getCollections();
      setCollections(updatedCollections);
      setCollectionForm({ title: '', description: '' });
      setEditingCollectionId(null);
      setMessage(editingCollectionId ? 'Colección actualizada correctamente.' : 'Colección creada correctamente.');
    } catch (error) {
      console.error(error);
      setMessage('No se pudo crear la colección.');
    }
  };

  const handleDeleteCollection = async (collection) => {
    if (!window.confirm(`¿Eliminar la colección "${collection.title}" y todos sus perfumes asociados?`)) {
      return;
    }

    setIsDeleting(true);
    setDeletingLabel(`Eliminando la colección "${collection.title}"...`);

    try {
      await deleteCollection(collection.id);
      const [updatedCollections, updatedProducts] = await Promise.all([
        getCollections(),
        getProducts(),
      ]);

      setCollections(updatedCollections);
      setProducts(updatedProducts);
      setMessage('Colección eliminada y productos asociados movidos a borradores.');
      setToast({ type: 'success', text: 'Colección eliminada.' });
    } catch (error) {
      console.error(error);
      setMessage('No se pudo eliminar la colección.');
      setToast({ type: 'error', text: 'No se pudo eliminar la colección.' });
    } finally {
      setIsDeleting(false);
      setDeletingLabel('');
    }
  };

  const handleAttachImages = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!selectedProductId) {
      setMessage('Selecciona un producto antes de añadir imágenes.');
      return;
    }

    if (!pendingFiles.length) {
      setMessage('Selecciona al menos una imagen.');
      return;
    }

    try {
      const imageUrls = await Promise.all(pendingFiles.map((file) => uploadProductImage(file)));

      await addImagesToProduct(selectedProductId, imageUrls);
      const availableProducts = await getProducts();
      setProducts(availableProducts);
      setPendingFiles([]);
      setMessage('Imágenes añadidas correctamente.');
    } catch (error) {
      console.error(error);
      setMessage('No se pudo procesar una o más imágenes.');
    }
  };

  return (
    <section className="rounded-none border border-border bg-background p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
          Panel de productos
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea productos nuevos y añade varias fotos para que se vean en la galería del detalle del producto.
        </p>
      </div>

      {message ? <p className="mb-6 text-sm text-foreground">{message}</p> : null}
      {isDeleting ? (
        <div className="mb-6 flex items-center gap-3 rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" aria-label="Eliminando" />
          <span>{deletingLabel || 'Procesando...'}</span>
        </div>
      ) : null}
      {/* Modal overlay for long operations */}
      {isDeleting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-background p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-3">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{deletingLabel || 'Procesando...'}</p>
            <p className="text-xs text-muted-foreground">Esto puede tardar unos segundos. No cierres la página.</p>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-none border border-border bg-background p-4 shadow-lg">
          <div className={`rounded-none p-3 text-sm ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
            {toast.text}
          </div>
        </div>
      ) : null}

      <form id="product-form-top" onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product-name">Nombre</Label>
          <Input id="product-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-price">Precio</Label>
          <Input id="product-price" type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-original-price">Precio Original</Label>
          <Input id="product-original-price" type="number" min="0" value={form.originalPrice} onChange={(event) => setForm({ ...form, originalPrice: event.target.value })} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product-description">Descripción</Label>
          <Textarea id="product-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-collection">Colección</Label>
          <Select value={form.collection} onValueChange={(value) => setForm({ ...form, collection: value })}>
            <SelectTrigger id="product-collection">
              <SelectValue placeholder="Colección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personalizados">Personalizados</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-video-url">Video de YouTube</Label>
          <Input id="product-video-url" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-image">Foto principal</Label>
          <Input id="product-image" type="file" accept="image/*" onChange={handleFiles} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-additional-images">Fotos adicionales</Label>
          <Input id="product-additional-images" type="file" accept="image/*" multiple onChange={handleFiles} />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button type="submit" className="rounded-none" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : editingProductId ? 'Guardar cambios' : 'Crear producto'}
          </Button>
          {editingProductId ? (
            <Button type="button" variant="outline" className="rounded-none" onClick={cancelEdit}>Cancelar edición</Button>
          ) : null}
        </div>
      </form>

      <div className="mt-10 border-t border-border pt-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleCreateCollection} className="border border-border bg-card p-6 rounded-none">
            <h3 className="text-lg font-medium text-foreground">Crear colección</h3>
            <p className="mt-2 text-sm text-muted-foreground">Añade nuevas colecciones para que aparezcan en el catálogo y en el catálogo de colecciones.</p>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collection-title">Nombre</Label>
                <Input id="collection-title" value={collectionForm.title} onChange={(event) => setCollectionForm({ ...collectionForm, title: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-description">Descripción</Label>
                <Textarea id="collection-description" value={collectionForm.description} onChange={(event) => setCollectionForm({ ...collectionForm, description: event.target.value })} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="outline" className="rounded-none">{editingCollectionId ? 'Guardar cambios' : 'Crear colección'}</Button>
                {editingCollectionId ? (
                  <Button type="button" variant="outline" className="rounded-none" onClick={cancelCollectionEdit}>Cancelar</Button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="border border-border bg-card p-6 rounded-none">
            <h3 className="text-lg font-medium text-foreground">Colecciones existentes</h3>
              <div className="mt-4">
                <Input
                  placeholder="Buscar colección..."
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  className="mb-3 rounded-none border-border bg-background text-foreground w-full"
                />
                <div className="max-h-[420px] overflow-y-auto pr-2 space-y-3">
                  {collections
                    .filter((c) => {
                      const q = collectionSearch.trim().toLowerCase();
                      if (!q) return true;
                      return [c.title, c.description]
                        .filter(Boolean)
                        .some((v) => v.toString().toLowerCase().includes(q));
                    })
                    .map((collection) => (
                      <div key={collection.id} className="flex items-center justify-between gap-3 border border-border p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{collection.title}</p>
                          <p className="text-xs text-muted-foreground">{collection.description || 'Sin descripción'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" className="rounded-none" onClick={() => startEditingCollection(collection)}>Editar</Button>
                          <Button type="button" variant="destructive" className="rounded-none" onClick={() => handleDeleteCollection(collection)} disabled={isDeleting}>
                            {isDeleting ? 'Borrando...' : 'Eliminar'}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
          </div>

        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">Productos</h3>
            <p className="text-sm text-muted-foreground">Gestiona productos publicados y borradores.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              className="rounded-none border-border bg-background text-foreground w-full sm:w-72"
            />
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ver:</span>
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} className="rounded-none" onClick={() => setViewMode('grid')}>Cuadros</Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} className="rounded-none" onClick={() => setViewMode('list')}>Lista</Button>
              </div>
                <div className="relative" ref={filtersRef}>
                  <Button variant="outline" className="rounded-none flex items-center gap-2" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} aria-label="Abrir filtros">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Filtros
                  </Button>

                  {showFilters ? (
                    <div className="absolute right-0 mt-2 w-72 border border-border bg-card p-4 rounded-none z-50 shadow">
                      <div className="space-y-3">
                        <div>
                          <Label>Estado</Label>
                          <select
                            value={productFilter}
                            onChange={(e) => { setProductFilter(e.target.value); setShowFilters(false); }}
                            className="rounded-none border border-input bg-transparent px-3 py-2 text-sm w-full">
                            <option value="published">Disponibles</option>
                            <option value="draft">Borradores</option>
                            <option value="all">Todos</option>
                          </select>
                        </div>
                        <div>
                          <Label>Ordenar por</Label>
                          <select
                            value={productSort}
                            onChange={(e) => { setProductSort(e.target.value); setShowFilters(false); }}
                            className="rounded-none border border-input bg-transparent px-3 py-2 text-sm w-full">
                            <option value="collection-asc">Colección A → Z</option>
                            <option value="collection-desc">Colección Z → A</option>
                            <option value="price-asc">Precio ↑</option>
                            <option value="price-desc">Precio ↓</option>
                            <option value="name-asc">Nombre A → Z</option>
                            <option value="name-desc">Nombre Z → A</option>
                          </select>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" className="rounded-none" onClick={() => setShowFilters(false)}>Cerrar</Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {viewMode === 'grid' ? (
            (() => {
              const visibleProducts = products
                .filter((product) => (productFilter === 'all' ? true : product.status === productFilter))
                .filter((product) => {
                  const query = productSearch.trim().toLowerCase();
                  if (!query) return true;
                  return [product.name, product.description, product.collection]
                    .filter(Boolean)
                    .some((value) => value.toString().toLowerCase().includes(query));
                })
                .slice()
                .sort((a, b) => {
                  switch (productSort) {
                    case 'collection-asc':
                      return (a.collection || '').toString().localeCompare((b.collection || '').toString());
                    case 'collection-desc':
                      return (b.collection || '').toString().localeCompare((a.collection || '').toString());
                    case 'price-asc':
                      return (Number(a.price) || 0) - (Number(b.price) || 0);
                    case 'price-desc':
                      return (Number(b.price) || 0) - (Number(a.price) || 0);
                    case 'name-asc':
                      return (a.name || '').toString().localeCompare((b.name || '').toString());
                    case 'name-desc':
                      return (b.name || '').toString().localeCompare((a.name || '').toString());
                    default:
                      return 0;
                  }
                });

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {visibleProducts.map((product) => (
                    <div key={product.id} className="border border-border bg-card p-3 rounded-none">
                      <div className="flex items-start gap-4">
                        {(() => {
                          const resolvedImage = resolveProductImage(product);
                          return resolvedImage ? (
                            <img
                              src={resolvedImage}
                              alt={product.name}
                              className="h-20 w-20 object-cover rounded-none"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-none border border-dashed border-border bg-muted flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              Sin
                            </div>
                          );
                        })()}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-semibold text-foreground">{product.name}</h4>
                            <Badge variant={product.status === 'published' ? 'secondary' : 'outline'}>
                              {product.status === 'published' ? 'Publicado' : 'Borrador'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{product.description}</p>
                          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                            <span className="text-foreground font-semibold">${product.price.toFixed(2)}</span>
                            <span className="text-muted-foreground uppercase tracking-[0.18em] text-xs">{product.collection}</span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button type="button" variant="outline" className="rounded-none" onClick={() => startEditingProduct(product)}>Editar</Button>
                            {product.status === 'draft' ? (
                              <Button type="button" variant="default" className="rounded-none" onClick={() => handleRestoreProduct(product)} disabled={isDeleting}>
                                {isDeleting ? 'Procesando...' : 'Restaurar'}
                              </Button>
                            ) : (
                              <Button type="button" variant="outline" className="rounded-none" onClick={() => handleDeleteProduct(product)} disabled={isDeleting}>
                                {isDeleting ? 'Borrando...' : 'Borrar'}
                              </Button>
                            )}
                            {product.status === 'draft' ? (
                              <Button type="button" variant="destructive" className="rounded-none" onClick={() => handleDeleteProductPermanently(product)} disabled={isDeleting}>
                                {isDeleting ? 'Borrando...' : 'Eliminar definitivamente'}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            <div className="overflow-x-auto border border-border rounded-none bg-card">
              <table className="min-w-full text-left text-sm text-muted-foreground">
                <thead className="border-b border-border bg-background">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Colección</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Imágenes</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const visibleProducts = products
                      .filter((product) => (productFilter === 'all' ? true : product.status === productFilter))
                      .filter((product) => {
                        const query = productSearch.trim().toLowerCase();
                        if (!query) return true;
                        return [product.name, product.description, product.collection]
                          .filter(Boolean)
                          .some((value) => value.toString().toLowerCase().includes(query));
                      })
                      .slice()
                      .sort((a, b) => {
                        switch (productSort) {
                          case 'collection-asc':
                            return (a.collection || '').toString().localeCompare((b.collection || '').toString());
                          case 'collection-desc':
                            return (b.collection || '').toString().localeCompare((a.collection || '').toString());
                          case 'price-asc':
                            return (Number(a.price) || 0) - (Number(b.price) || 0);
                          case 'price-desc':
                            return (Number(b.price) || 0) - (Number(a.price) || 0);
                          case 'name-asc':
                            return (a.name || '').toString().localeCompare((b.name || '').toString());
                          case 'name-desc':
                            return (b.name || '').toString().localeCompare((a.name || '').toString());
                          default:
                            return 0;
                        }
                      });

                    return visibleProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 text-foreground font-medium">{product.name}</td>
                        <td className="px-4 py-3">{product.collection}</td>
                        <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs uppercase ${product.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {product.status === 'published' ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(product.images || [product.image]).filter(Boolean).length}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" className="rounded-none" onClick={() => startEditingProduct(product)}>Editar</Button>
                            {product.status === 'draft' ? (
                              <Button type="button" variant="default" className="rounded-none" onClick={() => handleRestoreProduct(product)} disabled={isDeleting}>
                                {isDeleting ? 'Procesando...' : 'Restaurar'}
                              </Button>
                            ) : (
                              <Button type="button" variant="outline" className="rounded-none" onClick={() => handleDeleteProduct(product)} disabled={isDeleting}>
                                {isDeleting ? 'Borrando...' : 'Borrar'}
                              </Button>
                            )}
                            {product.status === 'draft' ? (
                              <Button type="button" variant="destructive" className="rounded-none" onClick={() => handleDeleteProductPermanently(product)} disabled={isDeleting}>
                                {isDeleting ? 'Borrando...' : 'Eliminar definitivamente'}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductAdmin;
