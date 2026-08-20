import React from 'react';
import { Youtube } from 'lucide-react';
import { Button, Input, Label, Textarea, Badge } from '@/components/ui';
import { getProducts, createOrUpdateProduct, uploadProductImage, removeProductImages, addImagesToProduct, getCollections, createCollection, updateCollection, deleteCollection, deleteProduct, deleteProductPermanently, restoreProduct } from '@/lib/dataService';
import { resolveProductImage } from '@/lib/productImageResolver';
import PerfumeDetailModal from './PerfumeDetailModal';

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
  image: '',
};

const ProductAdmin = () => {
  const [products, setProducts] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [form, setForm] = React.useState(emptyForm);
  const [collectionForm, setCollectionForm] = React.useState(emptyCollectionForm);
  const [collectionImageFile, setCollectionImageFile] = React.useState(null);
  const [collectionImagePreview, setCollectionImagePreview] = React.useState('');
  const [pendingFiles, setPendingFiles] = React.useState([]);
  const [pendingImagePreviews, setPendingImagePreviews] = React.useState([]);
  const [persistedImageUrls, setPersistedImageUrls] = React.useState([]);
  const [selectedFileNames, setSelectedFileNames] = React.useState([]);
  const [selectedSavedImageIndex, setSelectedSavedImageIndex] = React.useState(null);
  const [selectedQueuedImageIndex, setSelectedQueuedImageIndex] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [toast, setToast] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deletingLabel, setDeletingLabel] = React.useState('');
  const [viewMode, setViewMode] = React.useState('list');
  const [collectionSearch, setCollectionSearch] = React.useState('');
  const [productFilter, setProductFilter] = React.useState('published');
  const [collectionFilter, setCollectionFilter] = React.useState('all');
  const [productSearch, setProductSearch] = React.useState('');
  const [productSort, setProductSort] = React.useState('collection-asc');
  const [showFilters, setShowFilters] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const filtersRef = React.useRef(null);
  const [editingProductId, setEditingProductId] = React.useState(null);
  const [editingCollectionId, setEditingCollectionId] = React.useState(null);
  const [selectedProductId, setSelectedProductId] = React.useState(null);
  const [selectedPerfume, setSelectedPerfume] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('products');

  const collectionOptions = React.useMemo(() => {
    const base = [{ id: 'personalizados', title: 'Personalizados' }];
    const mappedCollections = Array.isArray(collections)
      ? collections
          .map((collection) => ({
            id: String(collection?.id ?? '').trim(),
            title: String(collection?.title ?? 'Colección'),
          }))
          .filter((collection) => Boolean(collection.id))
      : [];

    return [...base, ...mappedCollections];
  }, [collections]);

  const validCollectionValue = React.useMemo(() => {
    if (!form.collection) return 'personalizados';
    return collectionOptions.some((collection) => collection.id === String(form.collection))
      ? String(form.collection)
      : 'personalizados';
  }, [collectionOptions, form.collection]);

  React.useEffect(() => {
    if (form.collection !== validCollectionValue) {
      setForm((previous) => ({ ...previous, collection: validCollectionValue }));
    }
  }, [form.collection, validCollectionValue]);

  const visibleProducts = React.useMemo(() => {
    return products
      .filter((product) => (productFilter === 'all' ? true : product.status === productFilter))
      .filter((product) => (collectionFilter === 'all' ? true : product.collection === collectionFilter))
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
  }, [products, productFilter, collectionFilter, productSearch, productSort]);

  React.useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const refreshCatalogData = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const [availableProducts, availableCollections] = await Promise.all([
        getProducts(),
        getCollections(),
      ]);

      setProducts(availableProducts);
      setCollections(availableCollections);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshCatalogData();
  }, [refreshCatalogData]);

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
      const previousImages = Array.isArray(currentProduct?.images)
        ? [...currentProduct.images]
        : currentProduct?.image
          ? [currentProduct.image]
          : [];
      const existingImages = editingProductId
        ? [...persistedImageUrls]
        : previousImages;

      let imageUrls = [];

      if (pendingFiles.length) {
        imageUrls = await Promise.all(pendingFiles.map((file) => uploadProductImage(file)));
      }

      const nextImages = [...new Set([...(existingImages || []), ...imageUrls])];
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
      if (editingProductId) {
        const removedImages = previousImages.filter((image) => !realImages.includes(image));
        if (removedImages.length) await removeProductImages(removedImages);
      }
      setForm(emptyForm);
      setPendingFiles([]);
      setPendingImagePreviews([]);
      setPersistedImageUrls([]);
      setSelectedFileNames([]);
      setSelectedProductId(null);
      setSelectedPerfume(null);
      setEditingProductId(null);
      setSelectedSavedImageIndex(null);
      setSelectedQueuedImageIndex(null);
      setMessage('');
      setIsLoading(true);
      const availableProducts = await getProducts();
      setProducts(availableProducts);
      setActiveTab('products');
      setIsLoading(false);

      const successMessage = editingProductId ? 'Cambio guardado exitosamente.' : 'Producto registrado exitosamente.';
      setToast({
        type: 'success',
        text: successMessage,
      });
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

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const previews = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: `${file.name}-${Date.now()}-${Math.random()}`, name: file.name, src: reader.result, file });
      reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
      reader.readAsDataURL(file);
    })));

    setPendingFiles((previous) => [...previous, ...files]);
    setPendingImagePreviews((previous) => [...previous, ...previews]);
    setSelectedFileNames((previous) => [...previous, ...files.map((file) => file.name)]);
  };

  const removeQueuedFile = (indexToRemove) => {
    setPendingFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    setPendingImagePreviews((previous) => previous.filter((_, index) => index !== indexToRemove));
    setSelectedFileNames((previous) => previous.filter((_, index) => index !== indexToRemove));
    setSelectedQueuedImageIndex((previous) => (previous === indexToRemove ? null : previous));
  };

  const prioritizeQueuedImage = (imageIndex) => {
    setPendingFiles((previous) => {
      if (!previous.length || imageIndex < 0 || imageIndex >= previous.length) return previous;
      const next = [...previous];
      const [item] = next.splice(imageIndex, 1);
      next.unshift(item);
      return next;
    });
    setPendingImagePreviews((previous) => {
      if (!previous.length || imageIndex < 0 || imageIndex >= previous.length) return previous;
      const next = [...previous];
      const [item] = next.splice(imageIndex, 1);
      next.unshift(item);
      return next;
    });
    setSelectedQueuedImageIndex(null);
  };

  const removePersistedImage = (imageIndex) => {
    setPersistedImageUrls((previous) => previous.filter((_, index) => index !== imageIndex));
    setSelectedSavedImageIndex((previous) => (previous === imageIndex ? null : previous));
  };

  const prioritizePersistedImage = (imageIndex) => {
    setPersistedImageUrls((previous) => {
      if (!previous.length || imageIndex < 0 || imageIndex >= previous.length) return previous;
      const next = [...previous];
      const [item] = next.splice(imageIndex, 1);
      next.unshift(item);
      return next;
    });
    setSelectedSavedImageIndex(null);
  };

  const startEditingProduct = (product) => {
    const existingImages = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : product.image
        ? [product.image]
        : [];

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
    setPersistedImageUrls(existingImages);
    setSelectedSavedImageIndex(null);
    setSelectedQueuedImageIndex(null);
    setSelectedFileNames([]);
    setPendingFiles([]);
    setPendingImagePreviews([]);
    setEditingProductId(product.id);
    setSelectedProductId(product.id);
    setSelectedPerfume(null);
    setActiveTab('editor');
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
    setPendingImagePreviews([]);
    setPersistedImageUrls([]);
    setSelectedFileNames([]);
    setSelectedSavedImageIndex(null);
    setSelectedQueuedImageIndex(null);
    setActiveTab('products');
    setSelectedProductId(null);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Eliminar definitivamente "${product.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    setDeletingLabel(`Eliminando "${product.name}"...`);

    try {
      await deleteProduct(product.id);
      setProducts((previous) => previous.filter((item) => item.id !== product.id));
      if (editingProductId === product.id) {
        cancelEdit();
      }
      setMessage('Producto eliminado correctamente.');
      setToast({ type: 'success', text: 'Producto eliminado.' });
    } catch (error) {
      console.error(error);
      setMessage('No se pudo eliminar el producto.');
      setToast({ type: 'error', text: 'No se pudo eliminar el producto.' });
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
      setProducts((previous) => previous.filter((item) => item.id !== product.id));
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
      image: collection.image || '',
    });
    setCollectionImageFile(null);
    setCollectionImagePreview(collection.image || '');
    setEditingCollectionId(collection.id);
    setActiveTab('collection-editor');
    setMessage('');
  };

  const cancelCollectionEdit = () => {
    setEditingCollectionId(null);
    setCollectionForm(emptyCollectionForm);
    setCollectionImageFile(null);
    setCollectionImagePreview('');
    setActiveTab('collections');
  };

  const handleCollectionImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCollectionImageFile(file);
      setCollectionImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCollection = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!collectionForm.title.trim()) {
      setMessage('Añade el nombre de la colección.');
      return;
    }

    try {
      const imageUrl = collectionImageFile
        ? await uploadProductImage(collectionImageFile)
        : collectionForm.image;
      const newCollection = {
        id: editingCollectionId || collectionForm.title.toLowerCase().replace(/\s+/g, '-'),
        title: collectionForm.title.trim(),
        description: collectionForm.description.trim(),
        image: imageUrl || '',
      };

      if (editingCollectionId) {
        await updateCollection(editingCollectionId, newCollection);
      } else {
        await createCollection(newCollection);
      }
      const updatedCollections = await getCollections();
      setCollections(updatedCollections);
      setCollectionForm(emptyCollectionForm);
      setCollectionImageFile(null);
      setCollectionImagePreview('');
      setEditingCollectionId(null);
      setActiveTab('collections');
      setMessage(editingCollectionId ? 'Colección actualizada correctamente.' : 'Colección creada correctamente.');
    } catch (error) {
      console.error(error);
      const detail = error?.message || error?.details || error?.hint || 'Error desconocido.';
      setMessage(`No se pudo ${editingCollectionId ? 'actualizar' : 'crear'} la colección: ${detail}`);
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
      setCollections((previous) => previous.filter((item) => item.id !== collection.id));
      setProducts((previous) => previous.filter((item) => item.collection !== collection.id));
      setMessage('Colección eliminada correctamente.');
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
    <section className="rounded-none border border-border bg-background p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Admin</p>
          <h2 className="mt-2 text-2xl font-medium text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
            Catálogo de perfumes
          </h2>
        </div>

        {!editingProductId && activeTab !== 'collection-editor' ? (
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'products', label: 'Productos' },
              { id: 'add-product', label: 'Añadir producto' },
              { id: 'collections', label: 'Colecciones' },
              { id: 'add-collection', label: 'Añadir colección' },
            ].map((tab) => (
              <Button
                key={tab.id}
                type="button"
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className="rounded-none"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {message ? <p className="mb-6 text-sm text-foreground">{message}</p> : null}
      {isDeleting ? (
        <div className="mb-6 flex items-center gap-3 rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" aria-label="Eliminando" />
          <span>{deletingLabel || 'Procesando...'}</span>
        </div>
      ) : null}
      {isDeleting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-background p-6 text-center shadow-lg">
            <div className="mb-3 flex items-center justify-center">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" aria-hidden="true" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">{deletingLabel || 'Procesando...'}</p>
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

      {(activeTab === 'add-product' || activeTab === 'editor') ? (
        <div className="mb-8 rounded-none border border-border bg-card p-6">
          <div className="mb-6">
            <div>
              <h3 className="text-xl font-medium text-foreground">{editingProductId ? 'Editor del producto' : 'Añadir producto'}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{editingProductId ? 'Actualiza el perfume y ajusta sus fotos guardadas.' : 'Completa los datos y guarda el perfume en el catálogo.'}</p>
            </div>
          </div>

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
              <select
                id="product-collection"
                value={validCollectionValue}
                onChange={(event) => setForm((previous) => ({ ...previous, collection: event.target.value }))}
                className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
              >
                {collectionOptions.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-video-url">Video de YouTube</Label>
              <Input id="product-video-url" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-images">Agregar imágenes</Label>
              <Input id="product-images" type="file" accept="image/*" multiple onChange={handleFiles} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Imágenes</Label>
              <div className="flex flex-wrap gap-2">
                {persistedImageUrls.length || pendingImagePreviews.length ? (
                  <>
                    {persistedImageUrls.map((image, index) => (
                      <div key={`${image}-${index}`} className="relative">
                        <button
                          type="button"
                          onClick={() => setSelectedSavedImageIndex(selectedSavedImageIndex === index ? null : index)}
                          className="block border border-border bg-background p-0"
                          aria-label={`Editar imagen guardada ${index + 1}`}
                        >
                          <img src={image} alt={`Imagen guardada ${index + 1}`} className="h-16 w-16 object-cover" />
                        </button>

                        {selectedSavedImageIndex === index ? (
                          <div className="absolute inset-x-0 bottom-0 z-10 flex gap-1 border border-border bg-background/90 p-1 backdrop-blur-sm">
                            <button type="button" onClick={() => prioritizePersistedImage(index)} className="flex-1 bg-black px-1 py-0.5 text-[7px] font-medium uppercase tracking-[0.08em] text-white">Principal</button>
                            <button type="button" onClick={() => removePersistedImage(index)} className="flex-1 border border-border bg-white px-1 py-0.5 text-[7px] font-medium uppercase tracking-[0.08em] text-foreground">Quitar</button>
                          </div>
                        ) : null}
                      </div>
                    ))}

                    {pendingImagePreviews.map((image, index) => (
                      <div key={image.id} className="relative">
                        <button
                          type="button"
                          onClick={() => setSelectedQueuedImageIndex(selectedQueuedImageIndex === index ? null : index)}
                          className="block border border-border bg-background p-0"
                          aria-label={`Editar imagen nueva ${index + 1}`}
                        >
                          <img src={image.src} alt={`Imagen nueva ${index + 1}`} className="h-16 w-16 object-cover" />
                        </button>

                        {selectedQueuedImageIndex === index ? (
                          <div className="absolute inset-x-0 bottom-0 z-10 flex gap-1 border border-border bg-background/90 p-1 backdrop-blur-sm">
                            <button type="button" onClick={() => prioritizeQueuedImage(index)} className="flex-1 bg-black px-1 py-0.5 text-[7px] font-medium uppercase tracking-[0.08em] text-white">Principal</button>
                            <button type="button" onClick={() => removeQueuedFile(index)} className="flex-1 border border-border bg-white px-1 py-0.5 text-[7px] font-medium uppercase tracking-[0.08em] text-foreground">Quitar</button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No hay imágenes todavía.</p>
                )}
              </div>
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
        </div>
      ) : null}

      {(activeTab === 'add-collection' || activeTab === 'collection-editor') ? (
        <div className="mb-8 rounded-none border border-border bg-card p-6">
          <div className="mb-6">
            <div>
              <h3 className="text-xl font-medium text-foreground">{editingCollectionId ? 'Editor de colección' : 'Añadir colección'}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{editingCollectionId ? 'Actualiza los datos y la imagen de portada de esta colección.' : 'Crea una nueva agrupación para organizar tus perfumes.'}</p>
            </div>
          </div>

          <form onSubmit={handleCreateCollection} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="collection-title">Nombre</Label>
              <Input id="collection-title" value={collectionForm.title} onChange={(event) => setCollectionForm({ ...collectionForm, title: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="collection-description">Descripción</Label>
              <Textarea id="collection-description" value={collectionForm.description} onChange={(event) => setCollectionForm({ ...collectionForm, description: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="collection-image">Imagen de portada</Label>
              <Input
                id="collection-image"
                type="file"
                accept="image/*"
                onChange={handleCollectionImage}
              />
              {collectionImagePreview ? (
                <img
                  src={collectionImagePreview.startsWith('data:') || collectionImagePreview.startsWith('http') ? collectionImagePreview : `${import.meta.env.BASE_URL}${collectionImagePreview.replace(/^\/+/, '')}`}
                  alt="Vista previa de la portada"
                  className="mt-3 h-40 w-full max-w-xs object-cover"
                />
              ) : (
                <p className="text-xs text-muted-foreground">Selecciona una imagen para usarla como portada de esta colección.</p>
              )}
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button type="submit" variant="outline" className="rounded-none">{editingCollectionId ? 'Guardar cambios' : 'Crear colección'}</Button>
              {editingCollectionId ? <Button type="button" variant="outline" className="rounded-none" onClick={cancelCollectionEdit}>Volver a colecciones</Button> : null}
            </div>
          </form>
        </div>
      ) : null}

      {(activeTab === 'products' || activeTab === 'collections') && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-medium text-foreground">{activeTab === 'collections' ? 'Colecciones' : 'Productos'}</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'collections'
                  ? 'Organiza tus grupos y edita la información de cada colección.'
                  : 'Gestiona tus perfumes y accede rápido a editar o borrar cada uno.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {activeTab === 'products' ? (
                <Input
                  placeholder="Buscar producto..."
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  className="w-full rounded-none border-border bg-background text-foreground sm:w-72"
                />
              ) : (
                <Input
                  placeholder="Buscar colección..."
                  value={collectionSearch}
                  onChange={(event) => setCollectionSearch(event.target.value)}
                  className="w-full rounded-none border-border bg-background text-foreground sm:w-72"
                />
              )}

              {activeTab === 'products' ? (
                <div className="flex flex-wrap gap-3">
                  <div className="relative" ref={filtersRef}>
                    <Button variant="outline" className="rounded-none flex items-center gap-2" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} aria-label="Abrir filtros">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                      </svg>
                      Filtros
                    </Button>
                    {showFilters ? (
                      <div className="absolute right-0 z-50 mt-2 w-72 border border-border bg-card p-4 shadow">
                        <div className="space-y-3">
                          <div>
                            <Label>Estado</Label>
                            <select
                              value={productFilter}
                              onChange={(e) => { setProductFilter(e.target.value); setShowFilters(false); }}
                              className="w-full rounded-none border border-input bg-transparent px-3 py-2 text-sm"
                            >
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
                              className="w-full rounded-none border border-input bg-transparent px-3 py-2 text-sm"
                            >
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
              ) : null}
            </div>
          </div>

          {activeTab === 'products' ? (
            <>
              <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-none border border-border/60 bg-muted/10 px-2 py-2 [scrollbar-width:auto]">
                <div className="flex w-max min-w-full flex-nowrap gap-2">
                <Button
                  type="button"
                  variant={collectionFilter === 'all' ? 'default' : 'outline'}
                  className="shrink-0 rounded-none"
                  onClick={() => setCollectionFilter('all')}
                >
                  Todas
                </Button>
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    type="button"
                    variant={collectionFilter === collection.id ? 'default' : 'outline'}
                    className="shrink-0 rounded-none"
                    onClick={() => setCollectionFilter(collection.id)}
                  >
                    {collection.title}
                  </Button>
                ))}
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-foreground/50" />
                    Cargando productos
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="animate-pulse border border-border bg-card p-2 sm:p-3">
                        <div className="mb-2 h-24 bg-muted/80 sm:h-32 md:h-40 xl:h-52" />
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="h-2.5 w-10 bg-muted/80 sm:h-3 sm:w-16" />
                          <div className="h-3.5 w-12 bg-muted/80 sm:h-4 sm:w-16" />
                        </div>
                        <div className="mb-2 h-2.5 w-full bg-muted/80 sm:h-3" />
                        <div className="mb-2 h-2.5 w-2/3 bg-muted/80 sm:h-3" />
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-4 w-10 bg-muted/80 sm:h-5 sm:w-16" />
                          <div className="h-2.5 w-8 bg-muted/80 sm:h-3 sm:w-12" />
                        </div>
                        <div className="mt-3 flex gap-1 sm:gap-2">
                          <div className="h-7 w-12 bg-muted/80 sm:h-9 sm:w-16" />
                          <div className="h-7 w-12 bg-muted/80 sm:h-9 sm:w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 xl:grid-cols-3">
                  {visibleProducts.map((product) => {
                    const resolvedImage = resolveProductImage(product);
                    const extraImageCount = Math.max((product.images?.length || 1) - 1, 0);
                    return (
                      <div
                        key={product.id}
                        className="cursor-pointer border border-border bg-card p-2 transition hover:border-foreground/30 sm:p-3"
                        onClick={() => setSelectedPerfume(product)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedPerfume(product);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative mb-2 overflow-hidden border border-border bg-background sm:mb-3">
                          <div className="absolute left-2 top-2 z-10 inline-flex items-center rounded-none border border-white/60 bg-background/80 px-1.5 py-0.5 text-[6px] font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur-sm sm:text-[7px]">
                            {product.collection || 'Personalizados'}
                          </div>
                          {resolvedImage ? (
                            <img src={resolvedImage} alt={product.name} className="h-24 w-full object-cover sm:h-32 md:h-40 xl:h-52" />
                          ) : (
                            <div className="flex h-24 items-center justify-center border border-dashed border-border bg-muted text-[8px] uppercase tracking-[0.2em] text-muted-foreground sm:h-32 md:h-40 xl:h-52 sm:text-[10px]">
                              Sin imagen
                            </div>
                          )}
                          {extraImageCount > 0 ? (
                            <span className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full border border-white/70 bg-black/35 px-1.5 py-0.5 text-[7px] font-medium text-white backdrop-blur-[1px] sm:text-[8px]">
                              +{extraImageCount}
                            </span>
                          ) : null}
                          {product.video_url || product.videoUrl ? (
                            <span
                              className="absolute bottom-2 left-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white shadow-sm"
                              title="Este perfume tiene vídeo"
                              aria-label="Este perfume tiene vídeo"
                            >
                              <Youtube className="h-4 w-4" aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div>
                            <h4 className="mt-1 text-xs font-semibold text-foreground sm:text-sm md:text-base">{product.name}</h4>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-none border px-0.5 py-0.5 text-[5px] font-medium uppercase tracking-[0.08em] sm:px-1 sm:py-0.5 sm:text-[7px] sm:tracking-[0.12em] ${
                              product.status === 'published'
                                ? 'border-emerald-200 bg-emerald-100/70 text-emerald-700'
                                : 'border-border bg-background text-muted-foreground'
                            }`}
                            style={{ lineHeight: 1.4 }}
                          >
                            {product.status === 'published' ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                        <p className="mt-2 text-[9px] text-muted-foreground line-clamp-3 sm:mt-3 sm:text-[11px]">{product.description}</p>
                        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
                          <div>
                            <span className="text-xs font-semibold text-foreground sm:text-sm md:text-base">${Number(product.price || 0).toFixed(2)}</span>
                            {product.originalPrice ? (
                              <p className="mt-1 text-[7px] text-amber-600 sm:text-[8px]" style={{ textDecoration: 'none' }}>
                                Original ${Number(product.originalPrice).toFixed(2)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-1 sm:mt-4 sm:flex sm:flex-wrap sm:gap-2">
                          <Button type="button" variant="outline" className="rounded-none w-full px-1 py-1 text-[7px] sm:w-auto sm:px-3 sm:py-1.5 sm:text-[10px]" onClick={(event) => { event.stopPropagation(); startEditingProduct(product); }}>Editar</Button>
                          {product.status === 'draft' ? (
                            <Button type="button" className="rounded-none w-full bg-black px-1 py-1 text-[7px] text-white hover:bg-black/90 sm:w-auto sm:px-3 sm:py-1.5 sm:text-[10px]" onClick={(event) => { event.stopPropagation(); handleRestoreProduct(product); }} disabled={isDeleting}>
                              Restaurar
                            </Button>
                          ) : (
                            <Button type="button" className="rounded-none w-full bg-black px-1 py-1 text-[7px] text-white hover:bg-black/90 sm:w-auto sm:px-3 sm:py-1.5 sm:text-[10px]" onClick={(event) => { event.stopPropagation(); handleDeleteProduct(product); }} disabled={isDeleting}>
                              Borrar
                            </Button>
                          )}
                          {product.status === 'draft' ? (
                            <Button type="button" className="rounded-none w-full bg-black px-1 py-1 text-[7px] text-white hover:bg-black/90 sm:w-auto sm:px-3 sm:py-1.5 sm:text-[10px]" onClick={(event) => { event.stopPropagation(); handleDeleteProductPermanently(product); }} disabled={isDeleting}>
                              Borrar
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}

          {activeTab === 'collections' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {collections
                .filter((collection) => {
                  const query = collectionSearch.trim().toLowerCase();
                  if (!query) return true;
                  return [collection.title, collection.description]
                    .filter(Boolean)
                    .some((value) => value.toString().toLowerCase().includes(query));
                })
                .map((collection) => {
                  const previewImage = collection.image || products.find((product) => product.collection === collection.id && product.image)?.image;
                  const previewImageSrc = previewImage
                    ? previewImage.startsWith('http')
                      ? previewImage
                      : `${import.meta.env.BASE_URL}${previewImage.replace(/^\/+/, '')}`
                    : '';

                  return (
                  <div key={collection.id} className="border border-border bg-card p-4">
                    {previewImageSrc ? (
                      <img src={previewImageSrc} alt={`Portada de ${collection.title}`} className="mb-4 h-36 w-full object-cover" />
                    ) : (
                      <div className="mb-4 flex h-36 items-center justify-center bg-muted text-xs uppercase tracking-widest text-muted-foreground">
                        Sin imagen
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Colección</p>
                        <h4 className="mt-1 text-xl font-semibold text-foreground">{collection.title}</h4>
                      </div>
                      <Badge variant="secondary">{products.filter((product) => product.collection === collection.id).length}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{collection.description || 'Sin descripción'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="rounded-none" onClick={() => startEditingCollection(collection)}>Editar</Button>
                      <Button type="button" className="rounded-none bg-black text-white hover:bg-black/90" onClick={() => handleDeleteCollection(collection)} disabled={isDeleting}>
                        Borrar
                      </Button>
                    </div>
                  </div>
                  );
                })}
            </div>
          ) : null}
        </div>
      )}

      <PerfumeDetailModal
        perfume={selectedPerfume}
        isOpen={Boolean(selectedPerfume)}
        onClose={() => setSelectedPerfume(null)}
      />
    </section>
  );
};

export default ProductAdmin;
