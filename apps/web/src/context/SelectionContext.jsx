import React from 'react';

const STORAGE_KEY = 'gd-essences-selection';

const readSelection = () => {
  try {
    const storedSelection = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(storedSelection)
      ? storedSelection.filter((product) => product && typeof product === 'object' && product.id)
      : [];
  } catch (error) {
    return [];
  }
};

const SelectionContext = React.createContext(null);

export const SelectionProvider = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = React.useState(readSelection);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const toggleProduct = (product) => {
    setSelectedProducts((previous) => (
      previous.some((selectedProduct) => selectedProduct.id === product.id)
        ? previous.filter((selectedProduct) => selectedProduct.id !== product.id)
        : [...previous, product]
    ));
  };

  const removeProduct = (productId) => {
    setSelectedProducts((previous) => previous.filter((product) => product.id !== productId));
  };

  const isSelected = (productId) => selectedProducts.some((product) => product.id === productId);

  return (
    <SelectionContext.Provider value={{ selectedProducts, toggleProduct, removeProduct, isSelected }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = React.useContext(SelectionContext);
  if (!context) throw new Error('useSelection debe utilizarse dentro de SelectionProvider.');
  return context;
};