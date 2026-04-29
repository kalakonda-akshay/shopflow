import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_cart') || '[]'); } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sf_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setOpen(true);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) { removeItem(id); return; }
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i)));
  };

  const clearCart = () => setItems([]);

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, open, setOpen, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
