import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fmt } from '../utils/helpers';

function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQty, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const goCheckout = () => { setOpen(false); navigate('/checkout'); };

  return (
    <>
      <div className="cart-overlay" onClick={() => setOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-header">
          <span className="cart-title">Your Cart {itemCount > 0 && `(${itemCount})`}</span>
          <button className="btn-ghost" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item._id}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=?'; }}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{fmt(item.price)} each</div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                    <button className="btn-ghost" onClick={() => removeItem(item._id)} title="Remove" style={{ marginLeft: 'auto', color: 'var(--rust)' }}>🗑</button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap' }}>
                  {fmt(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-val">{fmt(total)}</span>
            </div>
            <button className="btn btn-primary btn-full" onClick={goCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
